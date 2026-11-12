import { useMutation } from '@tanstack/react-query'
import type { ColDef } from 'ag-grid-community'
import { AlertTriangle, CheckCircle2, Clock, MapPinned, PackageCheck, PackageX, PieChart, Send, Truck, X } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useMapData } from '../components/domain/useMapData'
import { DataGrid } from '../components/grid/DataGrid'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Donut } from '../components/viz/Donut'
import { Kpi } from '../components/viz/Kpi'
import { Stepper, type Step } from '../components/viz/Stepper'
import { useDeliveries, useDelivery } from '../hooks/queries'
import { useCoordinator } from '../hooks/useCoordinator'
import { useInvalidateLive } from '../hooks/useInvalidateLive'
import { formatDateTime, formatNumber, humanize } from '../lib/format'
import { getApiError } from '../services/api'
import { deliveryApi } from '../services/endpoints'
import type { Delivery, DeliveryStatus } from '../types/api'

const OperationsMap = lazy(() => import('../components/domain/OperationsMap').then((m) => ({ default: m.OperationsMap })))

const STAGES: DeliveryStatus[] = ['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELAYED', 'DELIVERED', 'FAILED']
const ACTIVE = new Set<DeliveryStatus>(['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELAYED'])

type Action = 'DISPATCHED' | 'IN_TRANSIT' | 'DELAYED' | 'FAILED' | 'RECEIPT'

// Mirrors server/src/services/fulfilment/delivery.service.ts TRANSITIONS (DELIVERED only via receipt).
const NEXT: Record<DeliveryStatus, Action[]> = {
  PENDING: ['DISPATCHED', 'DELAYED', 'FAILED'],
  DISPATCHED: ['IN_TRANSIT', 'DELAYED', 'FAILED', 'RECEIPT'],
  IN_TRANSIT: ['DELAYED', 'FAILED', 'RECEIPT'],
  DELAYED: ['DISPATCHED', 'IN_TRANSIT', 'FAILED', 'RECEIPT'],
  DELIVERED: [],
  FAILED: [],
}

const ACTION_LABEL: Record<Action, string> = {
  DISPATCHED: 'Mark dispatched',
  IN_TRANSIT: 'Mark in transit',
  DELAYED: 'Report delay',
  FAILED: 'Mark failed',
  RECEIPT: 'Confirm NGO receipt',
}

const supplierOf = (d: Delivery) => d.procurementPurchase?.vendorOffer.vendor
const productOf = (d: Delivery) => d.procurementPurchase?.vendorOffer.product

function DeliveryPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const detail = useDelivery(id)
  const invalidate = useInvalidateLive()
  const { canAct, actorName } = useCoordinator()
  const [action, setAction] = useState<Action | null>(null)
  const [reason, setReason] = useState('')
  const [quantity, setQuantity] = useState('')
  const [receivedBy, setReceivedBy] = useState('')

  const d = detail.data?.delivery
  const mutate = useMutation({
    mutationFn: async () => {
      if (!d || !action) throw new Error('No delivery selected')
      const who = actorName ?? 'coordinator'
      if (action === 'RECEIPT') {
        return deliveryApi.receipt(d.id, { receivedBy: receivedBy.trim(), deliveredQuantity: Number(quantity), notes: reason.trim() || undefined, confirmedBy: who })
      }
      return deliveryApi.updateStatus(d.id, {
        status: action,
        reason: reason.trim() || undefined,
        dispatchedQuantity: action === 'DISPATCHED' && quantity ? Number(quantity) : undefined,
        updatedBy: who,
      })
    },
    onSuccess: () => {
      setAction(null)
      setReason('')
      setQuantity('')
      setReceivedBy('')
      invalidate()
      void detail.refetch()
    },
  })

  const open = (a: Action) => {
    mutate.reset()
    setReason('')
    setReceivedBy('')
    setQuantity(a === 'RECEIPT' ? String(d?.quantity ?? '') : a === 'DISPATCHED' ? String(d?.quantity ?? '') : '')
    setAction(a)
  }

  const qty = Number(quantity)
  const invalid =
    action === 'RECEIPT' ? !receivedBy.trim() || !Number.isInteger(qty) || qty < 0 || qty > (d?.quantity ?? 0)
    : action === 'DELAYED' || action === 'FAILED' ? reason.trim().length < 3
    : action === 'DISPATCHED' ? quantity !== '' && (!Number.isInteger(qty) || qty <= 0 || qty > (d?.quantity ?? 0))
    : false

  return (
    <Panel
      title={d ? `Delivery ${d.trackingRef ?? d.id}` : 'Delivery'}
      icon={Truck}
      iconTone="cyan"
      subtitle={d ? `${supplierOf(d)?.name ?? '—'} → ${d.allocation?.organization.name ?? d.destination}` : undefined}
      actions={<button type="button" className="icon-btn" onClick={onClose} aria-label="Close delivery"><X size={16} /></button>}
    >
      {detail.isLoading ? <LoadingSkeleton rows={3} /> : detail.isError ? <ErrorState compact error={detail.error} /> : d ? (
        <div className="stack">
          <Stepper steps={lifecycle(d)} />
          <dl className="facts">
            <div><dt>Status</dt><dd><StatusBadge status={d.status} /></dd></div>
            <div><dt>Product</dt><dd>{productOf(d)?.name ?? '—'}</dd></div>
            <div><dt>Planned</dt><dd>{formatNumber(d.quantity)} {d.procurementPurchase?.planItem.unit}</dd></div>
            <div><dt>Dispatched</dt><dd>{formatNumber(d.dispatchedQuantity)}</dd></div>
            <div><dt>Received</dt><dd>{formatNumber(d.deliveredQuantity)}</dd></div>
            <div><dt>ETA (supplier lead time)</dt><dd>{formatDateTime(d.estimatedAt)}</dd></div>
            <div><dt>Plan</dt><dd>{d.payment?.plan.name ?? '—'}</dd></div>
            <div><dt>PayPal capture</dt><dd className="mono">{d.payment?.paypalCaptureId ?? '—'}</dd></div>
          </dl>
          {d.receivedBy && <p className="banner banner--green">Received by {d.receivedBy} on {formatDateTime(d.receivedAt)}{d.receiptNotes ? ` · ${d.receiptNotes}` : ''}.</p>}
          {d.delayReason && d.status === 'DELAYED' && <p className="banner banner--amber">Delayed: {d.delayReason}</p>}
          {d.failureReason && <p className="banner banner--red">Failed: {d.failureReason}. <Link to="/replanning">Replan the shortfall →</Link></p>}
          {d.status === 'DELIVERED' && d.deliveredQuantity < d.quantity && (
            <p className="banner banner--amber">Short delivery: {d.quantity - d.deliveredQuantity} unit(s) missing. <Link to="/replanning">Create an amendment →</Link></p>
          )}

          <div className="workbench-actions">
            <span className="form-note">{canAct ? 'Status changes are recorded with your name. Only an NGO receipt completes a delivery.' : 'Sign in as a coordinator to update deliveries.'}</span>
            {NEXT[d.status].map((a) => (
              <button key={a} type="button" className={`btn btn--sm ${a === 'RECEIPT' ? 'btn--success' : a === 'FAILED' ? 'btn--danger' : 'btn--ghost'}`} disabled={!canAct} onClick={() => open(a)}>
                {a === 'RECEIPT' ? <CheckCircle2 size={14} /> : a === 'FAILED' ? <PackageX size={14} /> : a === 'DELAYED' ? <Clock size={14} /> : <Send size={14} />} {ACTION_LABEL[a]}
              </button>
            ))}
            {ACTIVE.has(d.status) && supplierOf(d) && (
              <Link className="btn btn--ghost btn--sm" to="/replanning"><AlertTriangle size={14} /> Report supplier failure</Link>
            )}
          </div>

          <h3 className="subhead">Timeline</h3>
          {detail.data!.timeline.length === 0 ? <p className="form-note">No events yet. Payment does not imply dispatch.</p> : (
            <ol className="timeline">
              {detail.data!.timeline.map((t) => (
                <li key={t.id}>
                  <time>{formatDateTime(t.createdAt)}</time>
                  <strong>{humanize(t.action)}</strong>
                  <span className="form-note">{describe(t.details)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : null}

      <ConfirmationDialog
        open={action !== null}
        title={action ? ACTION_LABEL[action] : ''}
        description={
          action === 'RECEIPT' ? 'Record what the NGO actually received. A smaller quantity is stored as a short delivery and can be replanned.'
          : action === 'FAILED' ? 'The delivery is closed as failed. Its quantity becomes eligible for an amendment proposal.'
          : action === 'DELAYED' ? 'The delivery stays active with a recorded delay reason.'
          : 'Updates the stored delivery and writes an audit event.'
        }
        confirmLabel={action ? ACTION_LABEL[action] : 'Confirm'}
        tone={action === 'FAILED' ? 'danger' : action === 'RECEIPT' ? 'success' : 'primary'}
        busy={mutate.isPending}
        confirmDisabled={invalid}
        error={mutate.isError ? getApiError(mutate.error) : undefined}
        onConfirm={() => mutate.mutate()}
        onClose={() => setAction(null)}
      >
        {action === 'RECEIPT' && (
          <>
            <label className="field"><span>Received by (NGO staff name)</span><input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} maxLength={120} /></label>
            <label className="field"><span>Quantity received (max {d?.quantity})</span><input type="number" min="0" max={d?.quantity} step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
          </>
        )}
        {action === 'DISPATCHED' && (
          <label className="field"><span>Quantity dispatched <em>defaults to planned</em></span><input type="number" min="1" max={d?.quantity} step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
        )}
        {(action === 'DELAYED' || action === 'FAILED' || action === 'RECEIPT') && (
          <label className="field">
            <span>{action === 'RECEIPT' ? 'Notes' : 'Reason'} {action === 'RECEIPT' && <em>optional</em>}</span>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={action === 'RECEIPT' ? 1000 : 500} />
          </label>
        )}
      </ConfirmationDialog>
    </Panel>
  )
}

function lifecycle(d: Delivery): Step[] {
  const order = ['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED']
  const reached = d.status === 'DELAYED' ? 2 : d.status === 'FAILED' ? -1 : order.indexOf(d.status)
  const short = d.status === 'DELIVERED' && d.deliveredQuantity < d.quantity
  return [
    { label: 'Paid', state: 'done' },
    { label: 'Dispatched', state: d.status === 'FAILED' && d.dispatchedQuantity === 0 ? 'failed' : reached >= 1 || d.dispatchedQuantity > 0 ? 'done' : reached === 0 ? 'current' : 'todo', note: d.dispatchedQuantity ? `${d.dispatchedQuantity}` : undefined },
    { label: d.status === 'DELAYED' ? 'Delayed' : 'In transit', state: d.status === 'DELAYED' ? 'current' : reached >= 2 ? 'done' : reached === 1 ? 'current' : 'todo' },
    { label: short ? 'Short receipt' : 'Received', state: d.status === 'FAILED' ? 'failed' : reached === 3 ? (short ? 'failed' : 'done') : 'todo', note: d.deliveredQuantity ? `${d.deliveredQuantity}/${d.quantity}` : undefined },
  ]
}

function describe(details: Record<string, unknown> | null): string {
  if (!details) return ''
  const pick = ['from', 'to', 'status', 'reason', 'receivedBy', 'deliveredQuantity', 'shortfall', 'updatedBy', 'confirmedBy', 'type', 'isSimulation']
  return pick.filter((k) => details[k] !== undefined && details[k] !== null).map((k) => `${k}: ${String(details[k])}`).join(' · ')
}

export function FulfilmentPage() {
  const deliveries = useDeliveries()
  const [selected, setSelected] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | null>(null)

  const rows = useMemo(() => (deliveries.data ?? []).filter((d) => !statusFilter || d.status === statusFilter), [deliveries.data, statusFilter])
  const all = useMemo(() => deliveries.data ?? [], [deliveries.data])
  const counts = STAGES.map((s) => ({ status: s, count: all.filter((d) => d.status === s).length }))
  const units = {
    planned: all.reduce((s, d) => s + d.quantity, 0),
    dispatched: all.reduce((s, d) => s + d.dispatchedQuantity, 0),
    received: all.reduce((s, d) => s + d.deliveredQuantity, 0),
    shortOrFailed: all.reduce((s, d) => s + (d.status === 'FAILED' || d.status === 'DELIVERED' ? d.quantity - d.deliveredQuantity : 0), 0),
  }
  const map = useMapData(all)

  const cols = useMemo<ColDef<Delivery>[]>(() => [
    { headerName: 'Tracking ref', field: 'trackingRef', cellClass: 'grid-mono', minWidth: 140 },
    { headerName: 'Status', field: 'status', cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} /> },
    { headerName: 'Supplier', valueGetter: ({ data }) => (data ? supplierOf(data)?.name : ''), minWidth: 170 },
    { headerName: 'NGO', valueGetter: ({ data }) => data?.allocation?.organization.name ?? data?.destination, minWidth: 170 },
    { headerName: 'Product', valueGetter: ({ data }) => (data ? productOf(data)?.name : '') },
    { headerName: 'Planned', field: 'quantity', type: 'quantity' },
    { headerName: 'Dispatched', field: 'dispatchedQuantity', type: 'quantity' },
    { headerName: 'Received', field: 'deliveredQuantity', type: 'quantity', cellClassRules: { 'tone-red': ({ data }) => !!data && data.status === 'DELIVERED' && data.deliveredQuantity < data.quantity } },
    { headerName: 'ETA', field: 'estimatedAt', valueFormatter: ({ value }) => formatDateTime(value as string) },
    { headerName: 'Received by', field: 'receivedBy', valueFormatter: ({ value }) => (value as string | null) ?? '—' },
    { headerName: 'Plan', valueGetter: ({ data }) => data?.payment?.plan.name, minWidth: 180 },
    { headerName: 'Emergency', valueGetter: ({ data }) => data?.payment?.plan.emergency.name },
    { headerName: 'Issue', valueGetter: ({ data }) => data?.failureReason ?? data?.delayReason ?? '', flex: 1, minWidth: 200 },
  ], [])

  return (
    <div className="page">
      <PageHeader eyebrow="Delivery control tower" title="Fulfilment" description="Complete only when the NGO confirms receipt." />

      {deliveries.isError ? <ErrorState error={deliveries.error} onRetry={() => void deliveries.refetch()} /> : (
        <section className="kpi-row kpi-row--5">
          <Kpi label="Shipments" value={formatNumber(all.length)} icon={Truck} tone="blue" loading={deliveries.isLoading} />
          <Kpi label="Units planned" value={formatNumber(units.planned)} icon={PackageCheck} tone="purple" loading={deliveries.isLoading} />
          <Kpi label="Dispatched" value={formatNumber(units.dispatched)} icon={Send} tone="cyan" progress={units.planned ? units.dispatched / units.planned : 0} loading={deliveries.isLoading} />
          <Kpi label="Received" value={formatNumber(units.received)} icon={CheckCircle2} tone="green" progress={units.planned ? units.received / units.planned : 0} loading={deliveries.isLoading} />
          <Kpi label="Failed / short" value={formatNumber(units.shortOrFailed)} icon={PackageX} tone={units.shortOrFailed ? 'red' : 'neutral'} sub={units.shortOrFailed ? 'Replan →' : undefined} to={units.shortOrFailed ? '/replanning' : undefined} loading={deliveries.isLoading} />
        </section>
      )}

      <div className="grid-2-1">
        <Panel title="Routes" icon={MapPinned} iconTone="cyan" subtitle={`${map.routes.length} of ${all.length} shipments mapped · recorded coordinates only`} className="panel--flush">
          {map.points.length === 0 ? (
            <EmptyState compact title="No coordinates recorded" />
          ) : (
            <Suspense fallback={<LoadingSkeleton rows={1} height={340} />}>
              <OperationsMap points={map.points} routes={map.routes} height={340} />
            </Suspense>
          )}
        </Panel>
        <Panel title="Status" icon={PieChart} iconTone="green">
          <Donut data={counts.map((c) => ({ name: c.status, value: c.count }))} label="shipments" size={150} />
        </Panel>
      </div>

      <div className="status-strip" role="group" aria-label="Filter by status">
        <button type="button" className={`status-chip${statusFilter === null ? ' status-chip--active' : ''}`} onClick={() => setStatusFilter(null)}>All <strong>{all.length}</strong></button>
        {counts.map((c) => (
          <button key={c.status} type="button" className={`status-chip${statusFilter === c.status ? ' status-chip--active' : ''}`} onClick={() => setStatusFilter(statusFilter === c.status ? null : c.status)}>
            {humanize(c.status)} <strong>{c.count}</strong>
          </button>
        ))}
      </div>

      <div className={selected ? 'two-col two-col--detail' : undefined}>
        <Panel title="Shipments" icon={Truck} subtitle="Select one to track and update">
          <DataGrid rows={rows} columns={cols} getRowId={(r) => r.id} loading={deliveries.isLoading} height={460} pageSize={20} exportName="reliefos-deliveries" onRowClicked={(r) => setSelected(r.id)} selectedId={selected} emptyMessage="No deliveries. They are created when a PayPal payment is captured." />
        </Panel>
        {selected && <DeliveryPanel id={selected} onClose={() => setSelected(null)} />}
      </div>

    </div>
  )
}
