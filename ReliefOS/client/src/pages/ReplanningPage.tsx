import { useMutation, useQuery } from '@tanstack/react-query'
import type { ColDef } from 'ag-grid-community'
import { AlertOctagon, BrainCircuit, CheckCheck, FlaskConical, GitBranch, GitPullRequest, ListChecks, Plus, Send, ServerCog, ShieldCheck, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { ComparisonView, ProposalHeader, ValidationView } from '../components/domain/ProposalViews'
import { DataGrid } from '../components/grid/DataGrid'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Kpi } from '../components/viz/Kpi'
import {
  useAgentService,
  useDeliveries,
  useProcurementPlans,
  useProposals,
  useSupplierFailures,
  useVendorOffers,
  useVendors,
} from '../hooks/queries'
import { useCoordinator } from '../hooks/useCoordinator'
import { useInvalidateLive } from '../hooks/useInvalidateLive'
import { formatDateTime, formatINR, humanize } from '../lib/format'
import { getApiError } from '../services/api'
import { agentServiceApi, failureApi, replanningApi } from '../services/endpoints'
import { FAILURE_TYPES, type FailureType, type ReplanningProposal, type SupplierFailure } from '../types/platform'

const LIVE_PLAN = new Set(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'COMPLETED'])
const NEEDS_OFFER = new Set<FailureType>(['CAPACITY_REDUCED', 'INSUFFICIENT_STOCK', 'PRICE_CHANGED'])
const NEEDS_CAPACITY = new Set<FailureType>(['CAPACITY_REDUCED', 'INSUFFICIENT_STOCK'])

/* ------------------------------------------------------------------ report form */

function ReportFailure({ onReported, onClose }: { onReported: (event: SupplierFailure) => void; onClose: () => void }) {
  const { canAct, actorName } = useCoordinator()
  const invalidate = useInvalidateLive()
  const vendors = useVendors()
  const offers = useVendorOffers()
  const plans = useProcurementPlans()
  const deliveries = useDeliveries()

  const [type, setType] = useState<FailureType>('SUPPLIER_UNAVAILABLE')
  const [vendorId, setVendorId] = useState('')
  const [offerId, setOfferId] = useState('')
  const [planId, setPlanId] = useState('')
  const [deliveryId, setDeliveryId] = useState('')
  const [capacity, setCapacity] = useState('')
  const [price, setPrice] = useState('')
  const [reason, setReason] = useState('')
  const [simulation, setSimulation] = useState(true)

  const vendorOffers = (offers.data ?? []).filter((o) => o.vendorId === vendorId)
  const vendorDeliveries = (deliveries.data ?? []).filter(
    (d) => d.procurementPurchase?.vendorOffer.vendorId === vendorId && ['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELAYED'].includes(d.status),
  )
  const isWhatIf = type === 'WHAT_IF_SCENARIO'
  const sim = simulation || isWhatIf

  const missing =
    !vendorId ? 'Choose a supplier.'
    : reason.trim().length < 3 ? 'Give a reason (at least 3 characters).'
    : NEEDS_OFFER.has(type) && !offerId ? 'This failure type needs the affected offer.'
    : NEEDS_CAPACITY.has(type) && capacity === '' ? 'Enter the capacity the supplier can still provide.'
    : type === 'PRICE_CHANGED' && !price ? 'Enter the new unit price.'
    : type === 'DELIVERY_DELAYED' && !deliveryId ? 'Choose the delayed delivery.'
    : null

  const report = useMutation({
    mutationFn: () =>
      failureApi.report({
        type,
        vendorId,
        vendorOfferId: offerId || undefined,
        planId: planId || undefined,
        deliveryId: deliveryId || undefined,
        reportedCapacity: capacity === '' ? undefined : Number(capacity),
        reportedUnitPrice: price || undefined,
        reason: reason.trim(),
        isSimulation: sim,
        reportedBy: actorName ?? 'coordinator',
      }),
    onSuccess: (result) => {
      invalidate()
      onReported(result.event)
      setReason('')
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!missing) report.mutate()
  }

  return (
    <Panel title="Report a supplier failure" icon={AlertOctagon} iconTone="red" className="panel--accent" subtitle="Real reports update stored offers; simulations change nothing."
      actions={<button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><X size={16} /></button>}>
      <form className="form-grid form-grid--3" onSubmit={submit}>
        <label className="field">
          <span>Failure type</span>
          <select value={type} onChange={(e) => setType(e.target.value as FailureType)}>
            {FAILURE_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Supplier</span>
          <select value={vendorId} onChange={(e) => { setVendorId(e.target.value); setOfferId(''); setDeliveryId('') }} required>
            <option value="">Select a supplier</option>
            {(vendors.data ?? []).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Offer {!NEEDS_OFFER.has(type) && <em>optional: all offers</em>}</span>
          <select value={offerId} onChange={(e) => setOfferId(e.target.value)} disabled={!vendorId}>
            <option value="">{NEEDS_OFFER.has(type) ? 'Select the offer' : 'All of this supplier’s offers'}</option>
            {vendorOffers.map((o) => <option key={o.id} value={o.id}>{o.product.name} · ₹{o.unitPrice} · cap {o.capacity}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Plan <em>optional</em></span>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">Any affected plan</option>
            {(plans.data ?? []).filter((p) => LIVE_PLAN.has(p.status)).map((p) => <option key={p.id} value={p.id}>{p.name} · {humanize(p.status)} · v{p.version}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Delivery {type !== 'DELIVERY_DELAYED' && <em>optional</em>}</span>
          <select value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)} disabled={!vendorId}>
            <option value="">{vendorDeliveries.length ? 'None' : 'No active deliveries for this supplier'}</option>
            {vendorDeliveries.map((d) => <option key={d.id} value={d.id}>{d.trackingRef ?? d.id} · {d.destination} · {d.quantity}</option>)}
          </select>
        </label>
        {NEEDS_CAPACITY.has(type) && (
          <label className="field">
            <span>Capacity still available</span>
            <input type="number" min="0" step="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </label>
        )}
        {type === 'PRICE_CHANGED' && (
          <label className="field">
            <span>New unit price (INR)</span>
            <input type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
        )}
        <label className="field field--wide">
          <span>Reason (what the supplier reported)</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} placeholder="e.g. Warehouse flooded; cannot ship this week" />
        </label>
        <label className="check-field">
          <input type="checkbox" checked={sim} disabled={isWhatIf} onChange={(e) => setSimulation(e.target.checked)} />
          <span>Simulation (what-if)</span>
        </label>
        <div className="form-actions form-actions--end">
          <button type="submit" className={`btn ${sim ? 'btn--ghost' : 'btn--danger'}`} disabled={!canAct || Boolean(missing) || report.isPending}>
            {sim ? <FlaskConical size={16} /> : <AlertOctagon size={16} />} {report.isPending ? 'Recording…' : sim ? 'Record simulation' : 'Report real failure'}
          </button>
        </div>
      </form>
      {!canAct && <p className="form-note">Sign in as a coordinator to report failures.</p>}
      {canAct && missing && vendorId && <p className="form-note">{missing}</p>}
      {report.isError && <div className="inline-error">{getApiError(report.error)}</div>}
      {report.data && (
        <div className={`banner banner--${report.data.event.isSimulation ? 'amber' : 'red'}`}>
          {report.data.event.isSimulation ? 'Simulation recorded. No stored data changed.' : `Recorded. Effects: ${report.data.effects.length ? report.data.effects.join('; ') : 'none on stored records'}.`}
        </div>
      )}
    </Panel>
  )
}

/* ------------------------------------------------------------------ affected + generate */

function FailureDetail({ event, onProposal }: { event: SupplierFailure; onProposal: (id: string) => void }) {
  const { canAct, actorName } = useCoordinator()
  const invalidate = useInvalidateLive()
  const agentService = useAgentService()
  const affected = useQuery({ queryKey: ['supplier-failures', event.id, 'affected'], queryFn: () => failureApi.affected(event.id) })

  const generate = useMutation({
    mutationFn: (planId: string) =>
      replanningApi.generate({ sourcePlanId: planId, failureEventId: event.id, createdBy: actorName ?? 'coordinator', rationale: `Coordinator replanning for ${humanize(event.type)}` }),
    onSuccess: (r) => { invalidate(); onProposal(r.proposal.id) },
  })
  const agents = useMutation({
    mutationFn: (planId: string) => agentServiceApi.runReplanning({ plan_id: planId, failure_event_id: event.id }),
    onSuccess: (state) => { invalidate(); if (state.proposal_id) onProposal(state.proposal_id) },
  })

  return (
    <Panel
      title={`${humanize(event.type)} · ${event.vendor.name}`}
      icon={GitBranch}
      iconTone={event.isSimulation ? 'amber' : 'red'}
      subtitle={`${event.reason} · reported by ${event.reportedBy} · ${formatDateTime(event.createdAt)}`}
      actions={event.isSimulation ? <StatusBadge status="SIMULATION" tone="amber" label="Simulation" /> : <StatusBadge status="FAILED" label="Real failure" />}
    >
      {affected.isLoading ? <LoadingSkeleton rows={2} /> : affected.isError ? <ErrorState compact error={affected.error} /> : affected.data!.affectedPlans.length === 0 ? (
        <EmptyState compact title="No live plan uses this supplier" description="Nothing to replan." />
      ) : (
        <div className="stack">
          {affected.data!.affectedPlans.map((plan) => (
            <div key={plan.planId} className="card">
              <div className="tag-row">
                <strong>{plan.planName}</strong>
                <StatusBadge status={plan.status} />
                <span className="muted small">v{plan.version} · {plan.paid ? 'paid' : 'unpaid'} · {plan.affectedQuantity} units hit</span>
                <StatusBadge status={plan.suggestedMode} />
              </div>
              <ul className="em-list">
                {plan.purchases.map((p) => (
                  <li key={p.purchaseId}>
                    <div>
                      <strong>{p.vendorName} · {p.productName}</strong>
                      <small>{p.plannedQuantity} planned at {formatINR(p.unitPrice)} · NGOs: {p.ngos.map((n) => `${n.organizationName} (${n.allocatedQuantity})`).join(', ') || '—'}</small>
                    </div>
                    <span className="pay-list__amount">{p.affectedQuantity}</span>
                  </li>
                ))}
              </ul>
              <div className="workbench-actions">
                <button type="button" className="btn btn--ghost btn--sm" disabled={!canAct || generate.isPending || plan.affectedQuantity === 0} onClick={() => generate.mutate(plan.planId)}>
                  <ServerCog size={14} /> Generate proposal
                </button>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  disabled={!canAct || agents.isPending || agentService.isError || plan.affectedQuantity === 0}
                  title={agentService.isError ? 'Agent service (:8001) is offline' : 'Replanning Agent proposes, Revalidation Agent checks independently, then a human decides'}
                  onClick={() => agents.mutate(plan.planId)}
                >
                  <BrainCircuit size={14} /> {agents.isPending ? 'Agents working…' : 'Run replanning agents'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {(generate.isError || agents.isError) && <div className="inline-error">{getApiError(generate.error ?? agents.error)}</div>}
      {agents.data && (
        <div className={`banner banner--${agents.data.status === 'FAILED' ? 'red' : 'blue'}`}>
          <StatusBadge status={agents.data.status} /> {agents.data.error?.message ?? agents.data.next_action}{' '}
          <Link to={`/agents?workflow=${agents.data.workflow_id}`}>View trace →</Link>
        </div>
      )}
    </Panel>
  )
}

/* ------------------------------------------------------------------ proposal detail */

const REJECTED = new Set(['REJECTED_INFEASIBLE', 'REJECTED_STALE_DATA', 'REJECTED_VERSION_CONFLICT'])

function ProposalDetail({ proposal }: { proposal: ReplanningProposal }) {
  const { canAct, actorName } = useCoordinator()
  const invalidate = useInvalidateLive()
  const latest = proposal.validations[0]
  const validate = useMutation({ mutationFn: () => replanningApi.validate(proposal.id, actorName ?? 'coordinator'), onSuccess: invalidate })
  const submit = useMutation({ mutationFn: () => replanningApi.submit(proposal.id, actorName ?? 'coordinator'), onSuccess: invalidate })
  const open = !['APPROVED', 'REJECTED', 'SUPERSEDED', 'PENDING_APPROVAL'].includes(proposal.status)
  const canSubmit = open && !proposal.isSimulation && latest && !REJECTED.has(latest.outcome)

  return (
    <Panel title="Proposal" icon={ListChecks} iconTone="purple" subtitle={proposal.rationale ?? undefined}>
      <div className="stack">
        <ProposalHeader proposal={proposal} />
        {proposal.isSimulation && <p className="banner banner--amber">Simulation · comparison only</p>}
        {proposal.committedPlan && <p className="banner banner--green">Committed as plan <strong>{proposal.committedPlan.name}</strong> ({humanize(proposal.committedPlan.status)}).</p>}
        <ComparisonView comparison={proposal.comparison} />
        {latest ? <ValidationView report={latest} /> : <p className="form-note">Not validated yet.</p>}
        {open && (
          <div className="workbench-actions">
            <span className="muted small">Re-runs the optimizer on fresh data</span>
            <button type="button" className="btn btn--ghost btn--sm" disabled={!canAct || validate.isPending} onClick={() => validate.mutate()}>
              <CheckCheck size={14} /> {validate.isPending ? 'Validating…' : 'Validate on fresh data'}
            </button>
            <button type="button" className="btn btn--primary btn--sm" disabled={!canAct || !canSubmit || submit.isPending} onClick={() => submit.mutate()}>
              <Send size={14} /> Submit for approval
            </button>
          </div>
        )}
        {proposal.status === 'PENDING_APPROVAL' && <p className="form-note">Awaiting a coordinator in <Link to="/approvals">Approvals</Link>.</p>}
        {(validate.isError || submit.isError) && <div className="inline-error">{getApiError(validate.error ?? submit.error)}</div>}
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------ page */

export function ReplanningPage() {
  const failures = useSupplierFailures()
  const proposals = useProposals()
  const [eventId, setEventId] = useState<string | null>(null)
  const [proposalId, setProposalId] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)

  const event = (failures.data ?? []).find((f) => f.id === eventId) ?? null
  const proposal = (proposals.data ?? []).find((p) => p.id === proposalId) ?? null

  const failureCols = useMemo<ColDef<SupplierFailure>[]>(() => [
    { headerName: 'When', field: 'createdAt', valueFormatter: ({ value }) => formatDateTime(value as string), sort: 'desc', minWidth: 160 },
    { headerName: 'Kind', field: 'isSimulation', cellDataType: false, cellRenderer: ({ value }: { value: boolean }) => (value ? <StatusBadge status="SIMULATION" tone="amber" label="Simulation" /> : <StatusBadge status="FAILED" label="Real" />) },
    { headerName: 'Type', field: 'type', valueFormatter: ({ value }) => humanize(String(value)) },
    { headerName: 'Supplier', valueGetter: ({ data }) => data?.vendor.name, minWidth: 160 },
    { headerName: 'Product', valueGetter: ({ data }) => data?.vendorOffer?.product.name ?? 'All offers' },
    { headerName: 'Plan', valueGetter: ({ data }) => data?.plan?.name ?? '—' },
    { headerName: 'Delivery', valueGetter: ({ data }) => data?.delivery?.trackingRef ?? '—' },
    { headerName: 'Proposals', valueGetter: ({ data }) => data?.proposals.length ?? 0, type: 'quantity' },
    { headerName: 'Reason', field: 'reason', flex: 1, minWidth: 220 },
    { headerName: 'Reported by', field: 'reportedBy' },
  ], [])

  const proposalCols = useMemo<ColDef<ReplanningProposal>[]>(() => [
    { headerName: 'Created', field: 'createdAt', valueFormatter: ({ value }) => formatDateTime(value as string), sort: 'desc', minWidth: 160 },
    { headerName: 'Status', field: 'status', cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} />, minWidth: 170 },
    { headerName: 'Mode', field: 'mode', cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} /> },
    { headerName: 'Simulation', field: 'isSimulation', cellDataType: false, cellRenderer: ({ value }: { value: boolean }) => (value ? <StatusBadge status="SIMULATION" tone="amber" label="Sim" /> : null) },
    { headerName: 'Source plan', valueGetter: ({ data }) => (data?.sourcePlan ? `${data.sourcePlan.name} (v${data.sourcePlanVersion})` : data?.sourcePlanId), minWidth: 200 },
    { headerName: 'Cost change', valueGetter: ({ data }) => (data ? Number(data.comparison.costDelta) : null), type: 'inr' },
    { headerName: 'Coverage %', valueGetter: ({ data }) => data?.comparison.revisedCoverage, filter: 'agNumberColumnFilter' },
    { headerName: 'Latest validation', valueGetter: ({ data }) => data?.validations[0]?.outcome ?? '', cellRenderer: ({ value }: { value: string }) => (value ? <StatusBadge status={value} /> : '—'), minWidth: 190 },
    { headerName: 'By', field: 'createdBy' },
  ], [])

  return (
    <div className="page">
      <PageHeader
        eyebrow="Replanning · revalidation"
        title="Failure Recovery"
        description="Failure → proposal → independent check → human decision."
        actions={!showReport && <button type="button" className="btn btn--danger" onClick={() => setShowReport(true)}><Plus size={16} /> Report failure</button>}
      />
      <section className="kpi-row kpi-row--4">
        <Kpi label="Real failures" value={(failures.data ?? []).filter((f) => !f.isSimulation).length} icon={AlertOctagon} tone="red" loading={failures.isLoading} />
        <Kpi label="Simulations" value={(failures.data ?? []).filter((f) => f.isSimulation).length} icon={FlaskConical} tone="amber" loading={failures.isLoading} />
        <Kpi label="Proposals open" value={(proposals.data ?? []).filter((p) => !['APPROVED', 'REJECTED', 'SUPERSEDED'].includes(p.status)).length} icon={GitPullRequest} tone="purple" loading={proposals.isLoading} />
        <Kpi label="Committed revisions" value={(proposals.data ?? []).filter((p) => p.status === 'APPROVED').length} icon={ShieldCheck} tone="green" loading={proposals.isLoading} />
      </section>
      {showReport && <ReportFailure onReported={(e) => setEventId(e.id)} onClose={() => setShowReport(false)} />}

      <Panel title="Failure events" icon={AlertOctagon} subtitle="Select one to see impact and replan">
        {failures.isError ? <ErrorState compact error={failures.error} onRetry={() => void failures.refetch()} /> : (
          <DataGrid rows={failures.data} columns={failureCols} getRowId={(r) => r.id} loading={failures.isLoading} height={280} onRowClicked={(r) => setEventId(r.id)} selectedId={eventId} emptyMessage="No supplier failures recorded" />
        )}
      </Panel>
      {event && <FailureDetail event={event} onProposal={setProposalId} />}

      <Panel title="Proposals" icon={GitBranch} iconTone="purple" subtitle="Select one to compare and validate">
        {proposals.isError ? <ErrorState compact error={proposals.error} onRetry={() => void proposals.refetch()} /> : (
          <DataGrid rows={proposals.data} columns={proposalCols} getRowId={(r) => r.id} loading={proposals.isLoading} height={280} onRowClicked={(r) => setProposalId(r.id)} selectedId={proposalId} emptyMessage="No proposals yet" />
        )}
      </Panel>
      {proposal && <ProposalDetail proposal={proposal} />}
    </div>
  )
}
