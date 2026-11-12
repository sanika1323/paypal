import { Activity, AlertTriangle, ArrowRight, BrainCircuit, CreditCard, GitBranch, Globe2, PackageCheck, PieChart, ShieldCheck, ShoppingCart, Truck, Users, Wallet } from 'lucide-react'
import { lazy, Suspense, useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useMapData } from '../components/domain/useMapData'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { AgentGraph } from '../components/viz/AgentGraph'
import { BarList } from '../components/viz/BarList'
import { Donut } from '../components/viz/Donut'
import { Kpi } from '../components/viz/Kpi'
import { STATUS_COLOR } from '../components/viz/palette'
import {
  useAgentService,
  useAuditLogs,
  useDeliveries,
  useEmergencies,
  usePendingApprovals,
  useProcurementAnalytics,
  useProcurementPlans,
  useProposals,
  useSupplierFailures,
  useSupplierRisk,
  useWorkflow,
  useWorkflows,
} from '../hooks/queries'
import { formatINR, formatNumber, formatRelative, formatUSD, humanize } from '../lib/format'

const OperationsMap = lazy(() => import('../components/domain/OperationsMap').then((m) => ({ default: m.OperationsMap })))

const COMMITTED = new Set(['APPROVED', 'ORDERED', 'COMPLETED'])

export function OverviewPage() {
  const analytics = useProcurementAnalytics()
  const emergencies = useEmergencies()
  const approvals = usePendingApprovals()
  const proposals = useProposals()
  const failures = useSupplierFailures()
  const risk = useSupplierRisk()
  const audit = useAuditLogs()
  const plans = useProcurementPlans()
  const deliveries = useDeliveries()
  const workflows = useWorkflows()
  const agentService = useAgentService()
  const latest = workflows.data?.[0] ?? null
  const latestDetail = useWorkflow(latest?.id ?? null)
  const map = useMapData(deliveries.data ?? [])

  const a = analytics.data
  const active = (emergencies.data ?? []).filter((e) => e.isActive)
  const pendingDecisions = (approvals.data?.length ?? 0) + (proposals.data ?? []).filter((p) => p.status === 'PENDING_APPROVAL').length
  const realFailures = (failures.data ?? []).filter((f) => !f.isSimulation).length
  const capturedUSD = (plans.data ?? []).flatMap((p) => p.payments).filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount), 0)

  const agentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of latestDetail.data?.steps ?? []) counts[s.agent] = (counts[s.agent] ?? 0) + 1
    return counts
  }, [latestDetail.data])

  const spendByEmergency = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of plans.data ?? []) if (COMMITTED.has(p.status)) m.set(p.emergency.name, (m.get(p.emergency.name) ?? 0) + Number(p.totalCost))
    return [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6)
  }, [plans.data])

  const pipeline = a
    ? [
        { label: 'NGO requests', value: Object.values(a.requestsByStatus).reduce((s, n) => s + n, 0), icon: Users, to: '/requests' },
        { label: 'Awaiting approval', value: a.plansByStatus.PENDING_APPROVAL ?? 0, icon: ShieldCheck, to: '/approvals' },
        { label: 'Approved', value: (a.plansByStatus.APPROVED ?? 0) + (a.plansByStatus.ORDERED ?? 0), icon: ShoppingCart, to: '/payments' },
        { label: 'Paid (PayPal)', value: a.capturedPayments, icon: CreditCard, to: '/payments' },
        { label: 'Units dispatched', value: a.unitsDispatched, icon: Truck, to: '/fulfilment' },
        { label: 'Units received', value: a.unitsDelivered, icon: PackageCheck, to: '/fulfilment' },
      ]
    : []

  return (
    <div className="page">
      <PageHeader
        eyebrow="Live operations"
        title="Command Center"
        description="Collective procurement across every active emergency."
        actions={
          <>
            <span className="live-pill"><i />Live</span>
            <Link to="/procurement" className="btn btn--primary"><ShoppingCart size={16} /> Plan a purchase</Link>
          </>
        }
      />

      {analytics.isError ? <ErrorState error={analytics.error} onRetry={() => void analytics.refetch()} /> : (
        <section className="kpi-row">
          <Kpi label="Active emergencies" value={formatNumber(active.length)} icon={AlertTriangle} tone="red" to="/emergencies" loading={emergencies.isLoading} />
          <Kpi label="Units requested" value={formatNumber(a?.requestedUnits)} icon={Users} tone="cyan" to="/requests" loading={analytics.isLoading} />
          <Kpi label="Committed" value={formatINR(a?.committedSpendINR)} icon={Wallet} tone="purple" sub={a ? `of ${formatINR(a.committedBudgetINR)} budget` : undefined}
            progress={a ? Number(a.committedSpendINR) / Math.max(1, Number(a.committedBudgetINR)) : undefined} to="/payments" loading={analytics.isLoading} />
          <Kpi label="Captured" value={formatUSD(capturedUSD)} icon={CreditCard} tone="blue" sub={`${a?.capturedPayments ?? 0} PayPal Sandbox payments`} to="/payments" loading={plans.isLoading} />
          <Kpi label="Received by NGOs" value={formatNumber(a?.unitsDelivered)} icon={PackageCheck} tone="green" sub={a ? `of ${formatNumber(a.unitsShipped)} shipped` : undefined}
            progress={a && a.unitsShipped ? a.unitsDelivered / a.unitsShipped : undefined} to="/fulfilment" loading={analytics.isLoading} />
          <Kpi label="Needs a human" value={formatNumber(pendingDecisions)} icon={ShieldCheck} tone="amber" sub={`${realFailures} real supplier failures`} to="/approvals" loading={approvals.isLoading} />
        </section>
      )}

      <section className="flowband" aria-label="Procurement pipeline">
        {analytics.isLoading ? <LoadingSkeleton rows={1} height={84} /> : pipeline.map((s, i) => (
          <Link key={s.label} to={s.to} className="flowband__stage" style={{ animationDelay: `${i * 70}ms` }}>
            <span className="flowband__icon"><s.icon size={17} /></span>
            <strong>{formatNumber(s.value)}</strong>
            <span>{s.label}</span>
            {i < pipeline.length - 1 && <span className="flowband__wire" aria-hidden="true"><i /></span>}
          </Link>
        ))}
      </section>

      <div className="grid-cc">
        <Panel title="Operations map" icon={Globe2} iconTone="cyan" subtitle={`${map.points.length} locations · ${map.routes.length} routes`} className="panel--flush">
          {map.points.length === 0 && !map.loading ? (
            <EmptyState compact title="No coordinates recorded" description="Add latitude/longitude to emergencies, NGOs or suppliers." />
          ) : (
            <Suspense fallback={<LoadingSkeleton rows={1} height={380} />}>
              <OperationsMap points={map.points} routes={map.routes} height={380} />
            </Suspense>
          )}
        </Panel>

        <Panel title="Agent network" icon={BrainCircuit} iconTone="purple"
          subtitle={latest ? `${humanize(latest.type)} · ${formatRelative(latest.createdAt)}` : agentService.isError ? 'Agent service offline' : 'No runs yet'}
          actions={<Link to={latest ? `/agents?workflow=${latest.id}` : '/agents'} className="btn btn--ghost btn--sm">Studio <ArrowRight size={14} /></Link>}>
          <AgentGraph counts={agentCounts} waitingHuman={latest?.status === 'WAITING_FOR_HUMAN'} compact />
          {latest && (
            <div className="tag-row tag-row--center">
              <StatusBadge status={latest.status} pulse={latest.status !== 'COMPLETED' && latest.status !== 'FAILED'} />
              <span className="muted">{humanize(latest.checkpoint ?? 'started')}</span>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid-3">
        <Panel title="Plans" icon={PieChart} iconTone="blue">
          {a ? <Donut data={Object.entries(a.plansByStatus).map(([name, value]) => ({ name, value }))} label="plans" /> : <LoadingSkeleton rows={2} />}
        </Panel>
        <Panel title="Deliveries" icon={Truck} iconTone="green">
          {a ? <Donut data={Object.entries(a.deliveriesByStatus).map(([name, value]) => ({ name, value }))} label="shipments" /> : <LoadingSkeleton rows={2} />}
        </Panel>
        <Panel title="Committed by emergency" icon={Wallet} iconTone="purple">
          {spendByEmergency.length === 0 ? <EmptyState compact title="No approved spend yet" /> : (
            <BarList rows={spendByEmergency.map(([name, v], i) => ({ key: name, label: name, value: v, display: formatINR(v), color: i === 0 ? 'linear-gradient(90deg,#8b5cf6,#22d3ee)' : undefined }))} />
          )}
        </Panel>
      </div>

      <div className="two-col">
        <Panel title="Supplier risk" icon={AlertTriangle} iconTone="amber" actions={<Link className="btn btn--ghost btn--sm" to="/suppliers">All <ArrowRight size={14} /></Link>}>
          {risk.isError ? <ErrorState compact error={risk.error} /> : (risk.data ?? []).length === 0 ? <EmptyState compact title="No suppliers" /> : (
            <BarList max={1} rows={[...(risk.data ?? [])].sort((x, y) => y.riskScore - x.riskScore).slice(0, 6).map((v) => ({
              key: v.vendorId, label: v.vendorName, value: Math.max(v.riskScore, 0.02), display: <StatusBadge status={v.riskLevel} />, color: STATUS_COLOR[v.riskLevel],
              hint: `${v.realFailures} real failures · ${v.reliabilityRated ? `${Math.round(v.reliability * 100)}% reliable` : 'unrated'}`,
            }))} />
          )}
        </Panel>
        <Panel title="Activity" icon={Activity} iconTone="cyan" actions={<Link className="btn btn--ghost btn--sm" to="/audit">Audit <ArrowRight size={14} /></Link>}>
          {audit.isLoading ? <LoadingSkeleton rows={5} /> : (audit.data ?? []).length === 0 ? <EmptyState compact title="No activity yet" /> : (
            <ul className="feed">
              {(audit.data ?? []).slice(0, 8).map((log) => (
                <li key={log.id}>
                  <i className={`feed__dot feed__dot--${log.action.includes('FAIL') || log.action.includes('REJECT') ? 'red' : log.action.includes('APPROV') || log.action.includes('CAPTUR') || log.action.includes('RECEIVED') ? 'green' : 'cyan'}`} />
                  <span>{humanize(log.action)}</span>
                  <time>{formatRelative(log.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      {failures.data && realFailures > 0 && (
        <Link to="/replanning" className="callout callout--amber"><GitBranch size={16} /> {realFailures} supplier failure(s) on record — open Failure Recovery <ArrowRight size={14} /></Link>
      )}
    </div>
  )
}
