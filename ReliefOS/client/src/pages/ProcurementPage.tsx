import { useMutation } from '@tanstack/react-query'
import type { ColDef } from 'ag-grid-community'
import { Boxes, BrainCircuit, Calculator, FileCheck2, Factory, GitMerge, PackageSearch, Save, Send, Sparkles, Users } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'

import { DataGrid } from '../components/grid/DataGrid'
import { decimalField } from '../components/grid/config'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { AgentGraph } from '../components/viz/AgentGraph'
import { FlowSankey, type FlowLink, type FlowNode } from '../components/viz/FlowSankey'
import { Kpi } from '../components/viz/Kpi'
import { C, tooltipStyle } from '../components/viz/palette'
import { Ring } from '../components/viz/Ring'
import { useAgentService, useEmergencies, useProcurementPlans, useWorkflow } from '../hooks/queries'
import { useCoordinator } from '../hooks/useCoordinator'
import { useInvalidateLive } from '../hooks/useInvalidateLive'
import { formatDateTime, formatINR, formatNumber, humanize, toNumber } from '../lib/format'
import { getApiError } from '../services/api'
import { agentApi, agentServiceApi, procurementApi } from '../services/endpoints'
import type { DemandAgentResult, OptimizationResult, ProcurementPlan, SupplierAgentResult } from '../types/api'

const STAGES = ['Demand', 'Suppliers', 'Optimize', 'Allocate', 'Approve', 'Pay']

/* ------------------------------------------------------------------ flow graph */

function buildFlow(demand: DemandAgentResult, result?: OptimizationResult) {
  const nodes: FlowNode[] = []
  const links: FlowLink[] = []
  const index = new Map<string, number>()
  const node = (key: string, name: string, kind: FlowNode['kind']) => {
    if (!index.has(key)) { index.set(key, nodes.length); nodes.push({ name, kind }) }
    return index.get(key)!
  }
  for (const p of demand.products) {
    const pi = node(`p:${p.productId}`, p.productName, 'product')
    const byOrg = new Map<string, { name: string; qty: number }>()
    for (const o of p.organizations) {
      const cur = byOrg.get(o.organizationId) ?? { name: o.organizationName, qty: 0 }
      cur.qty += o.requestedQuantity
      byOrg.set(o.organizationId, cur)
    }
    for (const [id, o] of byOrg) links.push({ source: node(`o:${id}`, o.name, 'ngo'), target: pi, value: o.qty })
  }
  if (result) {
    for (const pr of result.supplierPurchases) links.push({ source: index.get(`p:${pr.productId}`) ?? node(`p:${pr.productId}`, pr.productName, 'product'), target: node(`v:${pr.vendorId}`, pr.vendorName, 'supplier'), value: pr.quantity })
    for (const p of result.products) if (p.unfulfilledQuantity > 0) links.push({ source: index.get(`p:${p.productId}`)!, target: node('gap', 'Unmet', 'gap'), value: p.unfulfilledQuantity })
  }
  return { nodes, links }
}

/* ------------------------------------------------------------------ supplier comparison */

function SupplierComparison({ suppliers, result }: { suppliers: SupplierAgentResult; result?: OptimizationResult }) {
  const bought = new Map((result?.supplierPurchases ?? []).map((p) => [p.offerId, p.quantity]))
  return (
    <div className="compare">
      {suppliers.products.map((product) => {
        const maxPrice = Math.max(...product.offers.map((o) => Number(o.unitPrice)), 1)
        return (
          <div key={product.productId} className="compare__product">
            <div className="compare__title">
              <strong>{product.productName}</strong>
              <span className="muted">{formatNumber(product.requiredQuantity)} {product.unit} needed · {formatNumber(product.totalAvailableCapacity)} available</span>
            </div>
            {product.offers.length === 0 && <p className="muted">No usable offers.</p>}
            {product.offers.map((o) => {
              const qty = bought.get(o.offerId)
              return (
                <div key={o.offerId} className={`offer${qty ? ' offer--selected' : result ? ' offer--unused' : ''}`}>
                  <span className="offer__rank">#{o.rank}</span>
                  <div className="offer__who">
                    <strong>{o.vendorName}</strong>
                    <span className="muted">{o.vendorLocation} · {o.deliveryDays}d</span>
                  </div>
                  <div className="offer__metric">
                    <span>{formatINR(o.unitPrice)}</span>
                    <i className="offer__bar"><b style={{ width: `${(Number(o.unitPrice) / maxPrice) * 100}%` }} /></i>
                  </div>
                  <div className="offer__metric">
                    <span>{formatNumber(o.capacity)} cap</span>
                    <i className="offer__bar offer__bar--cap"><b style={{ width: `${Math.min(1, o.capacity / Math.max(1, product.requiredQuantity)) * 100}%` }} /></i>
                  </div>
                  <StatusBadge status={o.riskLevel} />
                  <span className="offer__pick">{qty ? <><Sparkles size={13} /> {formatNumber(qty)}</> : result ? '—' : ''}</span>
                </div>
              )
            })}
          </div>
        )
      })}
      {suppliers.unusableOffers.length > 0 && (
        <div className="tag-row">
          {suppliers.unusableOffers.map((u) => <span key={u.offerId} className="tag tag--red">{u.vendorName} · {humanize(u.state)}</span>)}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ page */

export function ProcurementPage() {
  const invalidate = useInvalidateLive()
  const agentService = useAgentService()
  const { canAct } = useCoordinator()
  const emergencies = useEmergencies()
  const plans = useProcurementPlans()
  const active = (emergencies.data ?? []).filter((item) => item.isActive)

  const [emergencyId, setEmergencyId] = useState('')
  const [budget, setBudget] = useState('')
  const [maxDays, setMaxDays] = useState('')
  const [savedPlan, setSavedPlan] = useState<ProcurementPlan | null>(null)

  const input = { emergencyId, budget: Number(budget), maxDeliveryDays: maxDays ? Number(maxDays) : undefined }
  const valid = emergencyId !== '' && input.budget > 0 && (!maxDays || (Number.isInteger(input.maxDeliveryDays) && input.maxDeliveryDays! > 0))

  const analysis = useMutation({
    mutationFn: async () => {
      const [demand, suppliers] = await Promise.all([agentApi.demand(emergencyId), agentApi.suppliers(emergencyId)])
      return { demand, suppliers }
    },
    onSuccess: () => { optimize.reset(); setSavedPlan(null) },
  })
  const optimize = useMutation({ mutationFn: () => procurementApi.optimize(input), onSuccess: () => setSavedPlan(null) })
  const save = useMutation({ mutationFn: () => procurementApi.createPlan(input), onSuccess: (plan) => { setSavedPlan(plan); invalidate() } })
  const submit = useMutation({
    mutationFn: (planId: string) => procurementApi.submitPlan(planId),
    onSuccess: (plan) => { setSavedPlan((c) => (c && c.id === plan.id ? { ...c, status: plan.status } : c)); invalidate() },
  })
  const workflow = useMutation({
    mutationFn: () => agentServiceApi.runProcurement({ emergency_id: emergencyId, budget: input.budget, max_delivery_days: input.maxDeliveryDays }),
    onSuccess: invalidate,
  })
  const trace = useWorkflow(workflow.data?.workflow_id ?? null)
  const traceCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of trace.data?.steps ?? []) c[s.agent] = (c[s.agent] ?? 0) + 1
    return c
  }, [trace.data])

  const onAnalyze = (event: FormEvent) => { event.preventDefault(); if (valid) analysis.mutate() }

  const result = optimize.data
  const stage = savedPlan?.status === 'PENDING_APPROVAL' ? 5 : savedPlan ? 4 : result ? 4 : analysis.data ? 2 : emergencyId ? 1 : 0
  const flow = useMemo(() => (analysis.data ? buildFlow(analysis.data.demand, result) : null), [analysis.data, result])

  const allocationData = useMemo(() => {
    const m = new Map<string, { name: string; requested: number; allocated: number }>()
    for (const a of result?.ngoAllocations ?? []) {
      const cur = m.get(a.organizationId) ?? { name: a.organizationName, requested: 0, allocated: 0 }
      cur.requested += a.requestedQuantity
      cur.allocated += a.allocatedQuantity
      m.set(a.organizationId, cur)
    }
    return [...m.values()]
  }, [result])

  const planCols = useMemo<ColDef<ProcurementPlan>[]>(() => [
    { headerName: 'Plan', field: 'name', minWidth: 220 },
    { headerName: 'Emergency', valueGetter: ({ data }) => data?.emergency.name },
    { headerName: 'Status', field: 'status', cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} /> },
    { headerName: 'v', field: 'version', type: 'quantity', width: 70 },
    { headerName: 'Revision of', valueGetter: ({ data }) => data?.revisionOf?.name ?? data?.revisionOfId ?? '', minWidth: 140 },
    { headerName: 'Budget', valueGetter: decimalField<ProcurementPlan>((r) => r.totalBudget), type: 'inr' },
    { headerName: 'Cost', valueGetter: decimalField<ProcurementPlan>((r) => r.totalCost), type: 'inr' },
    { headerName: 'Created', field: 'createdAt', valueFormatter: ({ value }) => formatDateTime(value as string), sort: 'desc' },
    {
      headerName: '',
      cellRenderer: ({ data }: { data?: ProcurementPlan }) =>
        data?.status === 'DRAFT' ? (
          <button type="button" className="btn btn--ghost btn--sm" disabled={submit.isPending} onClick={() => submit.mutate(data.id)}><Send size={13} /> Submit</button>
        ) : null,
    },
  ], [submit])

  const budgetNum = toNumber(result?.budget) ?? 0
  const costNum = toNumber(result?.estimatedCost) ?? 0

  return (
    <div className="page">
      <PageHeader eyebrow="Core workflow" title="Collective Procurement" description="Many NGO requests, one optimized purchase." />

      <ol className="rail">
        {STAGES.map((s, i) => (
          <li key={s} className={i < stage ? 'rail__step rail__step--done' : i === stage ? 'rail__step rail__step--current' : 'rail__step'}><span>{i + 1}</span>{s}</li>
        ))}
      </ol>

      <Panel title="Launch" icon={Calculator} iconTone="cyan" className="panel--accent">
        <form className="launch" onSubmit={onAnalyze}>
          <label className="field">
            <span>Emergency</span>
            <select value={emergencyId} onChange={(e) => setEmergencyId(e.target.value)} required>
              <option value="">{active.length ? 'Select an active emergency' : 'No active emergencies'}</option>
              {active.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.location}</option>)}
            </select>
          </label>
          <label className="field"><span>Budget (INR)</span><input type="number" min="1" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} required /></label>
          <label className="field"><span>Max days <em>optional</em></span><input type="number" min="1" step="1" value={maxDays} onChange={(e) => setMaxDays(e.target.value)} /></label>
          <div className="launch__actions">
            <button type="submit" className="btn btn--primary" disabled={!valid || analysis.isPending}><PackageSearch size={16} /> {analysis.isPending ? 'Analyzing…' : 'Analyze'}</button>
            <button type="button" className="btn btn--glow" disabled={!valid || !canAct || workflow.isPending || agentService.isError}
              title={agentService.isError ? 'Agent service (:8001) is offline' : 'Agents draft and submit a plan; a human approves'} onClick={() => workflow.mutate()}>
              <BrainCircuit size={16} /> {workflow.isPending ? 'Agents working…' : 'Run with agents'}
            </button>
          </div>
        </form>
        {analysis.isError && <div className="inline-error">{getApiError(analysis.error)}</div>}
        {workflow.isError && <div className="inline-error">{getApiError(workflow.error)}</div>}
        {(workflow.isPending || workflow.data) && (
          <div className="agent-run">
            <AgentGraph running={workflow.isPending} counts={traceCounts} waitingHuman={workflow.data?.status === 'WAITING_FOR_HUMAN'} compact />
            {workflow.data && (
              <div className="agent-run__result">
                <StatusBadge status={workflow.data.status} pulse />
                <strong>{humanize(workflow.data.checkpoint)}</strong>
                {workflow.data.results.optimization != null && (
                  <span className="muted">{formatINR((workflow.data.results.optimization as { estimatedCost: string }).estimatedCost)} planned</span>
                )}
                <span className="muted">{workflow.data.error?.message ?? workflow.data.next_action}</span>
                <span className="tag-row">
                  <Link className="btn btn--ghost btn--sm" to={`/agents?workflow=${workflow.data.workflow_id}`}>Trace</Link>
                  {workflow.data.status === 'WAITING_FOR_HUMAN' && <Link className="btn btn--primary btn--sm" to="/approvals">Approve</Link>}
                </span>
              </div>
            )}
          </div>
        )}
      </Panel>

      {analysis.data && (
        <>
          <section className="kpi-row kpi-row--5">
            <Kpi label="NGO requests" value={formatNumber(analysis.data.demand.summary.totalRequests)} icon={Users} tone="cyan" sub={`${analysis.data.demand.summary.participatingOrganizations} NGOs`} />
            <Kpi label="Collective demand" value={formatNumber(analysis.data.demand.summary.totalDemand)} icon={Boxes} tone="purple" sub={`${analysis.data.demand.summary.distinctProducts} product(s)`} />
            <Kpi label="Offers ranked" value={formatNumber(analysis.data.suppliers.summary.totalOffersEvaluated)} icon={Factory} tone="blue" sub={`${analysis.data.suppliers.unusableOffers.length} unusable`} />
            <Kpi label="Demand flags" value={formatNumber(analysis.data.demand.issues.length)} icon={GitMerge} tone={analysis.data.demand.issues.length ? 'amber' : 'green'} sub={analysis.data.demand.issues.length ? 'Duplicates / conflicts' : 'Clean'} to={analysis.data.demand.issues.length ? '/demand' : undefined} />
            {result ? (
              <Kpi label="Plan cost" value={formatINR(result.estimatedCost)} icon={Calculator} tone={result.feasible ? 'green' : 'red'} sub={result.feasible ? 'Feasible' : !result.budgetFeasible ? 'Over budget' : 'Capacity short'} progress={budgetNum ? costNum / budgetNum : 0} />
            ) : (
              <Kpi label="Plan cost" value="—" icon={Calculator} tone="neutral" sub="Run the optimizer" />
            )}
          </section>

          {flow && (
            <Panel title="Collective demand flow" icon={GitMerge} iconTone="purple" subtitle={result ? 'NGOs → product → suppliers' : 'NGOs → product'}>
              <FlowSankey nodes={flow.nodes} links={flow.links} height={Math.max(220, Math.min(420, flow.nodes.length * 44))} />
            </Panel>
          )}

          <Panel title="Supplier comparison" icon={Factory} iconTone="blue" subtitle="Ranked by price, then speed, then reliability"
            actions={<button type="button" className="btn btn--primary btn--sm" disabled={!valid || optimize.isPending} onClick={() => optimize.mutate()}><Sparkles size={14} /> {optimize.isPending ? 'Optimizing…' : result ? 'Re-optimize' : 'Optimize'}</button>}>
            <SupplierComparison suppliers={analysis.data.suppliers} result={result} />
            {optimize.isError && <div className="inline-error">{getApiError(optimize.error)}</div>}
          </Panel>
        </>
      )}

      {result && (
        <>
          <div className="grid-opt">
            <Panel title="Optimization" icon={Calculator} iconTone="green">
              <div className="rings">
                <Ring value={costNum} max={budgetNum} label={`${budgetNum ? Math.round((costNum / budgetNum) * 100) : 0}%`} sub="of budget" color={result.budgetFeasible ? C.cyan : C.red} />
                <Ring value={result.fulfillment.fulfilledQuantity} max={result.fulfillment.totalDemand} label={`${result.fulfillment.fulfillmentPercentage}%`} sub="coverage" color={result.fulfillment.unfulfilledQuantity ? C.amber : C.green} />
              </div>
              <dl className="facts">
                <div><dt>Cost</dt><dd>{formatINR(result.estimatedCost)}</dd></div>
                <div><dt>Remaining</dt><dd>{formatINR(result.remainingBudget)}</dd></div>
                <div><dt>Units</dt><dd>{formatNumber(result.fulfillment.fulfilledQuantity)} / {formatNumber(result.fulfillment.totalDemand)}</dd></div>
                <div><dt>Suppliers</dt><dd>{new Set(result.supplierPurchases.map((p) => p.vendorId)).size}</dd></div>
              </dl>
              <p className="muted small">Deterministic optimizer · not AI</p>
            </Panel>
            <Panel title="NGO allocation" icon={Users} iconTone="cyan" subtitle="Requested vs allocated">
              <ResponsiveContainer width="100%" height={Math.max(180, allocationData.length * 46 + 50)}>
                <BarChart data={allocationData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }} barGap={3}>
                  <CartesianGrid stroke={C.grid} horizontal={false} />
                  <XAxis type="number" stroke={C.text} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={140} stroke={C.text} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="requested" name="Requested" fill="rgba(148,163,184,0.35)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="allocated" name="Allocated" fill={C.cyan} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {result.excludedOffers.length > 0 && (
            <div className="tag-row">
              <span className="muted">Not usable:</span>
              {result.excludedOffers.map((o) => <span key={o.offerId} className="tag tag--amber" title={o.reason}>{o.vendorName} · {o.reason}</span>)}
            </div>
          )}

          <div className="actionbar">
            <div>
              {savedPlan ? <><strong>{savedPlan.name}</strong> <StatusBadge status={savedPlan.status} /></> : <span className="muted">{result.feasible ? 'The server recomputes on save.' : 'Infeasible: raise the budget or add suppliers.'}</span>}
            </div>
            <button type="button" className="btn btn--ghost" disabled={!result.feasible || save.isPending || Boolean(savedPlan)} onClick={() => save.mutate()}><Save size={16} /> {save.isPending ? 'Saving…' : 'Save draft'}</button>
            <button type="button" className="btn btn--primary" disabled={!savedPlan || savedPlan.status !== 'DRAFT' || submit.isPending} onClick={() => savedPlan && submit.mutate(savedPlan.id)}><Send size={16} /> Submit for approval</button>
            {savedPlan?.status === 'PENDING_APPROVAL' && <Link className="btn btn--glow" to="/approvals">Go to approvals</Link>}
          </div>
          {(save.isError || submit.isError) && <div className="inline-error">{getApiError(save.error ?? submit.error)}</div>}
        </>
      )}

      {!analysis.data && !analysis.isPending && !workflow.data && (
        <EmptyState compact icon={PackageSearch} title="Pick an emergency and a budget" />
      )}

      <Panel title="Plans" icon={FileCheck2}>
        {plans.isError ? <ErrorState compact error={plans.error} onRetry={() => void plans.refetch()} /> : (
          <DataGrid rows={plans.data} columns={planCols} getRowId={(r) => r.id} loading={plans.isLoading} height={320} pageSize={10} exportName="reliefos-plans" emptyMessage="No procurement plans yet" />
        )}
      </Panel>
    </div>
  )
}
