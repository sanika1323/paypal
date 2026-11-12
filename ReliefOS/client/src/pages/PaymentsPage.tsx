import { useMutation } from '@tanstack/react-query'
import type { ColDef } from 'ag-grid-community'
import { ArrowLeftRight, BadgeCheck, CreditCard, DollarSign, ExternalLink, IndianRupee, LineChart, PieChart, Wallet } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { DataGrid } from '../components/grid/DataGrid'
import { decimalField } from '../components/grid/config'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Donut } from '../components/viz/Donut'
import { Kpi } from '../components/viz/Kpi'
import { C, tooltipStyle } from '../components/viz/palette'
import { Stepper } from '../components/viz/Stepper'
import { useProcurementPlans } from '../hooks/queries'
import { useCoordinator } from '../hooks/useCoordinator'
import { useInvalidateLive } from '../hooks/useInvalidateLive'
import { formatDateTime, formatINR, formatUSD } from '../lib/format'
import { getApiError } from '../services/api'
import { paymentApi } from '../services/endpoints'
import type { CaptureResult, CheckoutResult, Payment, ProcurementPlan, VerifyOrderResult } from '../types/api'

type PaymentRow = Payment & { planName: string; emergency: string; planStatus: string }

const ACTIVE = new Set(['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED'])

function ReadyToPay({ plans }: { plans: ProcurementPlan[] }) {
  const { canAct } = useCoordinator()
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null)
  const start = useMutation({ mutationFn: paymentApi.checkout, onSuccess: setCheckout })
  const ready = plans.filter((plan) => plan.status === 'APPROVED' && !plan.payments.some((p) => ACTIVE.has(p.status)))

  return (
    <Panel title="Ready to pay" icon={Wallet} iconTone="green" subtitle="Charged in USD at a dated reference rate">
      {ready.length === 0 ? (
        <EmptyState compact title="No approved plans awaiting payment" description="Plans appear here after a coordinator approves them." />
      ) : (
        <ul className="pay-list">
          {ready.map((plan) => (
            <li key={plan.id}>
              <div>
                <strong>{plan.name}</strong>
                <small>{plan.emergency.name} · approved by {plan.approvals.find((a) => a.approved)?.approvedBy ?? '—'}</small>
              </div>
              <span className="pay-list__amount">{formatINR(plan.totalCost)}</span>
              <button type="button" className="btn btn--primary btn--sm" disabled={!canAct || start.isPending} onClick={() => start.mutate(plan.id)}>
                <CreditCard size={15} /> {start.isPending && start.variables === plan.id ? 'Creating order…' : 'Pay with PayPal Sandbox'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!canAct && ready.length > 0 && <p className="form-note">Sign in as a coordinator to start a payment.</p>}
      {start.isError && <div className="inline-error">{getApiError(start.error)}</div>}
      {checkout && (
        <div className="checkout-box">
          <Stepper steps={[
            { label: 'Approved', state: 'done' },
            { label: 'Order created', state: 'done', note: checkout.orderId },
            { label: 'Payer approves', state: 'current' },
            { label: 'Captured', state: 'todo' },
            { label: 'Deliveries', state: 'todo' },
          ]} />
          <dl className="fact-row">
            <div><dt>Procurement (INR)</dt><dd>{formatINR(checkout.originalAmountINR)}</dd></div>
            <div><dt>Checkout (USD)</dt><dd>{formatUSD(checkout.amountUSD)}</dd></div>
            <div><dt>INR→USD rate</dt><dd>{checkout.exchangeRate}</dd></div>
            <div><dt>Rate source</dt><dd>{checkout.exchangeRateProvider} · {checkout.exchangeRateDate}</dd></div>
            <div><dt>PayPal order</dt><dd className="mono">{checkout.orderId}</dd></div>
          </dl>
          <a className="btn btn--primary" href={checkout.approvalUrl}>
            <ExternalLink size={16} /> Continue to PayPal Sandbox
          </a>
        </div>
      )}
    </Panel>
  )
}

export function PaymentsPage() {
  const plans = useProcurementPlans()
  const { canAct } = useCoordinator()
  const invalidate = useInvalidateLive()
  const [verified, setVerified] = useState<Record<string, VerifyOrderResult>>({})
  const verify = useMutation({ mutationFn: paymentApi.verify, onSuccess: (r) => setVerified((v) => ({ ...v, [r.paymentId]: r })) })
  const capture = useMutation({ mutationFn: paymentApi.capture, onSuccess: invalidate })

  const rows = useMemo<PaymentRow[]>(
    () => (plans.data ?? []).flatMap((plan) => plan.payments.map((p) => ({ ...p, planName: plan.name, emergency: plan.emergency.name, planStatus: plan.status }))),
    [plans.data],
  )

  const paymentCols = useMemo<ColDef<PaymentRow>[]>(() => [
    { headerName: 'Plan', field: 'planName', minWidth: 200 },
    { headerName: 'Status', field: 'status', cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} /> },
    { headerName: 'Amount (INR)', valueGetter: decimalField<PaymentRow>((r) => r.originalAmountINR), type: 'inr' },
    { headerName: 'Charged (USD)', valueGetter: decimalField<PaymentRow>((r) => r.amount), type: 'usd' },
    { headerName: 'INR→USD', field: 'exchangeRate', valueFormatter: ({ value }) => (value ? String(value) : '—') },
    { headerName: 'Rate source', valueGetter: ({ data }) => (data?.exchangeRateProvider ? `${data.exchangeRateProvider} · ${data.exchangeRateDate}` : '—') },
    { headerName: 'PayPal order', field: 'paypalOrderId', cellClass: 'grid-mono' },
    { headerName: 'Capture', field: 'paypalCaptureId', cellClass: 'grid-mono', valueFormatter: ({ value }) => (value as string | null) ?? '—' },
    { headerName: 'PayPal says', valueGetter: ({ data }) => (data ? verified[data.id]?.paypalOrderStatus ?? '' : '') },
    { headerName: 'Created', field: 'createdAt', valueFormatter: ({ value }) => formatDateTime(value as string), sort: 'desc' },
    {
      headerName: 'Actions',
      minWidth: 220,
      cellRenderer: ({ data }: { data?: PaymentRow }) =>
        data && data.status === 'PENDING' && data.paypalOrderId ? (
          <span className="cell-actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => verify.mutate(data.id)}>Verify</button>
            <button type="button" className="btn btn--primary btn--sm" disabled={!canAct} onClick={() => capture.mutate(data.id)}>Capture</button>
          </span>
        ) : null,
    },
  ], [verified, verify, capture, canAct])

  const completed = useMemo(() => rows.filter((r) => r.status === 'COMPLETED'), [rows])
  const capturedUSD = completed.reduce((s, r) => s + Number(r.amount), 0)
  const capturedINR = completed.reduce((s, r) => s + Number(r.originalAmountINR ?? 0), 0)
  const committedINR = (plans.data ?? []).filter((p) => ['APPROVED', 'ORDERED', 'COMPLETED'].includes(p.status)).reduce((s, p) => s + Number(p.totalCost), 0)
  const rates = completed.map((r) => Number(r.exchangeRate)).filter((n) => n > 0)
  const series = useMemo(() => {
    const sorted = [...completed].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    return sorted.map((r, i) => ({
      date: new Date(r.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      usd: Number(sorted.slice(0, i + 1).reduce((s, x) => s + Number(x.amount), 0).toFixed(2)),
    }))
  }, [completed])
  const byStatus = Object.entries(rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {})).map(([name, value]) => ({ name, value }))

  return (
    <div className="page">
      <PageHeader eyebrow="PayPal Sandbox" title="Payments" description="INR accounting, USD checkout, server-verified capture."
        actions={<span className="live-pill live-pill--violet"><i />Sandbox</span>} />

      <section className="kpi-row kpi-row--4">
        <Kpi label="Committed" value={formatINR(committedINR)} icon={IndianRupee} tone="purple" sub="Approved plans" progress={committedINR ? capturedINR / committedINR : 0} loading={plans.isLoading} />
        <Kpi label="Captured" value={formatUSD(capturedUSD)} icon={DollarSign} tone="green" sub={`${formatINR(capturedINR)} settled`} loading={plans.isLoading} />
        <Kpi label="Payments" value={rows.length} icon={CreditCard} tone="blue" sub={`${completed.length} completed`} loading={plans.isLoading} />
        <Kpi label="Avg INR→USD" value={rates.length ? (rates.reduce((s, n) => s + n, 0) / rates.length).toFixed(6) : '—'} icon={ArrowLeftRight} tone="cyan" sub="Frankfurter, dated" loading={plans.isLoading} />
      </section>

      <div className="grid-2-1">
        <Panel title="Captured over time" icon={LineChart} iconTone="green">
          {series.length === 0 ? <EmptyState compact title="No captured payments yet" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series} margin={{ left: 0, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="usd-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.cyan} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="date" stroke={C.text} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={C.text} fontSize={11} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => `$${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v) => [formatUSD(Number(v)), 'Cumulative USD']} />
                <Area type="monotone" dataKey="usd" stroke={C.cyan} strokeWidth={2} fill="url(#usd-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>
        <Panel title="By status" icon={PieChart} iconTone="purple">
          <Donut data={byStatus} label="payments" size={150} />
        </Panel>
      </div>
      {plans.isLoading ? <LoadingSkeleton rows={2} height={120} /> : plans.isError ? <ErrorState error={plans.error} onRetry={() => void plans.refetch()} /> : <ReadyToPay plans={plans.data ?? []} />}

      <Panel title="Payments" icon={CreditCard} iconTone="purple" actions={<StatusBadge status="SANDBOX" tone="purple" label="Sandbox" />}>
        <DataGrid rows={rows} columns={paymentCols} getRowId={(r) => r.id} loading={plans.isLoading} height={300} emptyMessage="No payments yet" />
        {(verify.isError || capture.isError) && <div className="inline-error">{getApiError(verify.error ?? capture.error)}</div>}
        {capture.data && <p className="form-note">Captured {formatUSD(capture.data.amount)}. {capture.data.deliveriesGenerated ?? 0} deliveries generated.</p>}
      </Panel>

      <p className="muted small">Every checkout, capture and webhook is in the <Link to="/audit">audit trail</Link>.</p>
    </div>
  )
}

/** PayPal return_url (/payments/success?token=ORDER_ID) and cancel_url (/payments/cancel). */
export function PaymentReturnPage() {
  const location = useLocation()
  const cancelled = location.pathname.endsWith('/cancel')
  const orderId = new URLSearchParams(location.search).get('token')
  const plans = useProcurementPlans()
  const { canAct } = useCoordinator()
  const invalidate = useInvalidateLive()
  const [result, setResult] = useState<CaptureResult | null>(null)
  const capture = useMutation({ mutationFn: paymentApi.capture, onSuccess: (r) => { setResult(r); invalidate() } })

  const match = (plans.data ?? []).flatMap((plan) => plan.payments.map((p) => ({ plan, payment: p }))).find((x) => x.payment.paypalOrderId === orderId)

  return (
    <div className="page">
      <PageHeader eyebrow="PayPal Sandbox" title={cancelled ? 'Checkout cancelled' : 'Complete payment'} description={cancelled ? 'The payer cancelled at PayPal. Nothing was charged; the payment stays pending.' : 'The payer approved the order at PayPal. Capture it to settle the procurement and generate deliveries.'} />
      <Panel title="PayPal order" icon={BadgeCheck} iconTone={cancelled ? 'amber' : 'green'}>
        {!orderId ? (
          <EmptyState compact title="No PayPal order in the URL" action={<Link className="btn btn--ghost btn--sm" to="/payments">Back to payments</Link>} />
        ) : plans.isLoading ? (
          <LoadingSkeleton rows={1} height={80} />
        ) : !match ? (
          <EmptyState compact title="Order not found" description={`No ReliefOS payment references PayPal order ${orderId}.`} />
        ) : (
          <>
            <dl className="fact-row">
              <div><dt>Plan</dt><dd>{match.plan.name}</dd></div>
              <div><dt>INR</dt><dd>{formatINR(match.payment.originalAmountINR)}</dd></div>
              <div><dt>USD</dt><dd>{formatUSD(match.payment.amount)}</dd></div>
              <div><dt>Order</dt><dd className="mono">{orderId}</dd></div>
              <div><dt>Status</dt><dd><StatusBadge status={result?.status ?? match.payment.status} /></dd></div>
            </dl>
            {!cancelled && match.payment.status === 'PENDING' && !result && (
              <div className="workbench-actions">
                <span className="form-note">{canAct ? 'Capture confirms the funds with PayPal and creates the delivery records.' : 'Sign in as a coordinator to capture.'}</span>
                <button type="button" className="btn btn--primary" disabled={!canAct || capture.isPending} onClick={() => capture.mutate(match.payment.id)}>
                  {capture.isPending ? 'Capturing…' : 'Capture payment'}
                </button>
              </div>
            )}
            {capture.isError && <div className="inline-error">{getApiError(capture.error)}</div>}
            {result && (
              <p className="form-note">
                {result.alreadyCompleted ? 'Payment was already captured.' : `Captured ${formatUSD(result.amount)}; ${result.deliveriesGenerated ?? 0} deliveries created.`}{' '}
                <Link to="/fulfilment">Track deliveries →</Link>
              </p>
            )}
          </>
        )}
      </Panel>
    </div>
  )
}
