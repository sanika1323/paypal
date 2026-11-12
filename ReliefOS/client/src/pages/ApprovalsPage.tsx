import { useMutation } from '@tanstack/react-query'
import type { ColDef } from 'ag-grid-community'
import { CheckCircle2, GitBranch, History, ShieldCheck, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ComparisonView, ProposalHeader, ValidationView } from '../components/domain/ProposalViews'
import { DataGrid } from '../components/grid/DataGrid'
import { BarList } from '../components/viz/BarList'
import { Kpi } from '../components/viz/Kpi'
import { Ring } from '../components/viz/Ring'
import { decimalField } from '../components/grid/config'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { usePendingApprovals, useProcurementPlans, useProposals } from '../hooks/queries'
import { useCoordinator } from '../hooks/useCoordinator'
import { useInvalidateLive } from '../hooks/useInvalidateLive'
import { formatDateTime, formatINR, formatRelative, toNumber } from '../lib/format'
import { getApiError } from '../services/api'
import { approvalApi, replanningApi } from '../services/endpoints'
import type { PendingApproval } from '../types/api'
import type { ReplanningProposal } from '../types/platform'

type HistoryRow = { id: string; kind: string; planName: string; emergency: string; approved: boolean; approvedBy: string; comments: string | null; createdAt: string; cost: string }

function ApprovalCard({ approval }: { approval: PendingApproval }) {
  const invalidate = useInvalidateLive()
  const { canAct, actorName } = useCoordinator()
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null)
  const [comments, setComments] = useState('')
  const plan = approval.plan

  const decide = useMutation({
    mutationFn: () =>
      mode === 'approve'
        ? approvalApi.approve(approval.id, { approvedBy: actorName ?? '', comments: comments.trim() || undefined })
        : approvalApi.reject(approval.id, { approvedBy: actorName ?? '', comments: comments.trim() }),
    onSuccess: () => {
      setMode(null)
      setComments('')
      invalidate()
    },
  })

  const rows = plan.items.flatMap((item) => item.purchases.map((p) => ({ ...p, productName: item.product.name, unit: item.unit })))
  const budget = toNumber(plan.totalBudget)
  const cost = toNumber(plan.totalCost)
  const gaps = plan.items.reduce((sum, item) => sum + item.unfulfilledQuantity, 0)

  return (
    <Panel
      title={plan.name}
      icon={ShieldCheck}
      iconTone="amber"
      subtitle={`${plan.emergency.name} · ${plan.emergency.location} · submitted ${formatRelative(approval.createdAt)}`}
      actions={<StatusBadge status="PENDING_APPROVAL" pulse />}
    >
      <div className="decision">
        <Ring value={cost ?? 0} max={budget ?? 1} label={formatINR(plan.totalCost)} sub={`of ${formatINR(plan.totalBudget)}`} size={128} />
        <div className="stack">
          <dl className="facts">
            <div><dt>Remaining</dt><dd>{budget !== null && cost !== null ? formatINR(budget - cost) : '—'}</dd></div>
            <div><dt>Products</dt><dd>{plan.items.length}</dd></div>
            <div><dt>Suppliers</dt><dd>{new Set(rows.map((r) => r.vendorOffer.vendor.name)).size}</dd></div>
            <div><dt>Gaps</dt><dd className={gaps ? 'tone-amber' : undefined}>{gaps}</dd></div>
          </dl>
          <BarList rows={rows.map((r) => ({ key: r.id, label: `${r.vendorOffer.vendor.name} · ${r.productName}`, value: Number(r.totalAmount), display: formatINR(r.totalAmount), hint: `${r.quantity} ${r.unit} × ${formatINR(r.unitPrice)} · ${r.deliveryDays}d` }))} />
        </div>
      </div>
      <div className="workbench-actions">
        <span className="muted small">{canAct ? `Deciding as ${actorName ?? 'coordinator'}` : 'Sign in to decide'}</span>
        <button type="button" className="btn btn--danger btn--sm" disabled={!canAct || !actorName} onClick={() => setMode('reject')}>
          <XCircle size={15} /> Reject
        </button>
        <button type="button" className="btn btn--success btn--sm" disabled={!canAct || !actorName} onClick={() => setMode('approve')}>
          <CheckCircle2 size={15} /> Approve
        </button>
      </div>
      <ConfirmationDialog
        open={mode !== null}
        title={mode === 'approve' ? 'Approve procurement plan' : 'Reject procurement plan'}
        description={
          mode === 'approve'
            ? `Approving commits ${formatINR(plan.totalCost)} and unlocks PayPal Sandbox checkout. Recorded as approved by ${actorName}.`
            : 'The plan will be rejected and cannot be paid. A reason is required and is stored in the audit trail.'
        }
        confirmLabel={mode === 'approve' ? 'Approve plan' : 'Reject plan'}
        tone={mode === 'approve' ? 'success' : 'danger'}
        busy={decide.isPending}
        confirmDisabled={mode === 'reject' && comments.trim().length === 0}
        error={decide.isError ? getApiError(decide.error) : undefined}
        onConfirm={() => decide.mutate()}
        onClose={() => {
          setMode(null)
          decide.reset()
        }}
      >
        <label className="field">
          <span>{mode === 'reject' ? 'Rejection reason' : 'Comments'} {mode === 'approve' && <em>optional</em>}</span>
          <textarea rows={3} value={comments} onChange={(event) => setComments(event.target.value)} maxLength={1000} />
        </label>
      </ConfirmationDialog>
    </Panel>
  )
}

function ProposalApprovalCard({ proposal }: { proposal: ReplanningProposal }) {
  const invalidate = useInvalidateLive()
  const { canAct, actorName } = useCoordinator()
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null)
  const [comment, setComment] = useState('')
  const latest = proposal.validations[0]

  const decide = useMutation({
    mutationFn: () =>
      mode === 'approve'
        ? replanningApi.approve(proposal.id, { decidedBy: actorName ?? '', comment: comment.trim() || undefined })
        : replanningApi.reject(proposal.id, { decidedBy: actorName ?? '', comment: comment.trim() }),
    onSuccess: () => {
      setMode(null)
      setComment('')
      invalidate()
    },
  })

  return (
    <Panel
      title={`Replanning proposal for ${proposal.sourcePlan?.name ?? 'plan'}`}
      icon={GitBranch}
      iconTone="purple"
      subtitle={proposal.mode === 'AMENDMENT' ? 'Amendment · paid plan untouched' : 'Replacement · original kept as history'}
      actions={<StatusBadge status="PENDING_APPROVAL" pulse />}
    >
      <div className="stack">
        <ProposalHeader proposal={proposal} />
        <ComparisonView comparison={proposal.comparison} />
        {latest && <ValidationView report={latest} />}
        <div className="workbench-actions">
          <span className="muted small">{canAct ? 'Re-validated on approval' : 'Sign in to decide'}</span>
          <button type="button" className="btn btn--danger btn--sm" disabled={!canAct || !actorName} onClick={() => setMode('reject')}>
            <XCircle size={15} /> Reject
          </button>
          <button type="button" className="btn btn--success btn--sm" disabled={!canAct || !actorName} onClick={() => setMode('approve')}>
            <CheckCircle2 size={15} /> Approve
          </button>
        </div>
      </div>
      <ConfirmationDialog
        open={mode !== null}
        title={mode === 'approve' ? 'Approve replanning proposal' : 'Reject replanning proposal'}
        description={
          mode === 'approve'
            ? `${proposal.mode === 'AMENDMENT' ? 'Creates an approved amendment plan that needs its own payment.' : 'Cancels the original unpaid plan and commits the revised one.'} Revised cost ${formatINR(proposal.comparison.revisedCost)}. Recorded as approved by ${actorName}.`
            : 'The original plan stays in force. A reason is required and is stored in the audit trail.'
        }
        confirmLabel={mode === 'approve' ? 'Approve proposal' : 'Reject proposal'}
        tone={mode === 'approve' ? 'success' : 'danger'}
        busy={decide.isPending}
        confirmDisabled={mode === 'reject' && comment.trim().length === 0}
        error={decide.isError ? getApiError(decide.error) : undefined}
        onConfirm={() => decide.mutate()}
        onClose={() => {
          setMode(null)
          decide.reset()
        }}
      >
        <label className="field">
          <span>{mode === 'reject' ? 'Rejection reason' : 'Comment'} {mode === 'approve' && <em>optional</em>}</span>
          <textarea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} />
        </label>
      </ConfirmationDialog>
    </Panel>
  )
}

export function ApprovalsPage() {
  const pending = usePendingApprovals()
  const plans = useProcurementPlans()
  const proposals = useProposals()
  const pendingProposals = (proposals.data ?? []).filter((p) => p.status === 'PENDING_APPROVAL')

  const history = useMemo<HistoryRow[]>(
    () =>
      (plans.data ?? []).flatMap((plan) =>
        plan.approvals
          .filter((a) => a.approvedBy !== 'PENDING_REVIEW')
          .map((a) => ({ id: a.id, kind: 'Plan', planName: plan.name, emergency: plan.emergency.name, approved: a.approved, approvedBy: a.approvedBy, comments: a.comments, createdAt: a.createdAt, cost: plan.totalCost })),
      ).concat(
        (proposals.data ?? [])
          .filter((p) => (p.status === 'APPROVED' || p.status === 'REJECTED') && p.decidedBy)
          .map((p) => ({ id: p.id, kind: `Proposal (${p.mode.toLowerCase()})`, planName: p.sourcePlan?.name ?? p.sourcePlanId, emergency: '', approved: p.status === 'APPROVED', approvedBy: p.decidedBy ?? '', comments: p.decisionComment, createdAt: p.decidedAt ?? p.createdAt, cost: p.comparison.revisedCost })),
      ),
    [plans.data, proposals.data],
  )

  const historyCols = useMemo<ColDef<HistoryRow>[]>(() => [
    { headerName: 'Plan', field: 'planName', minWidth: 220 },
    { headerName: 'Kind', field: 'kind' },
    { headerName: 'Emergency', field: 'emergency' },
    { headerName: 'Decision', field: 'approved', cellRenderer: ({ value }: { value: boolean }) => <StatusBadge status={value ? 'APPROVED' : 'REJECTED'} /> },
    { headerName: 'Decided by', field: 'approvedBy' },
    { headerName: 'Cost', valueGetter: decimalField<HistoryRow>((r) => r.cost), type: 'inr' },
    { headerName: 'Comments', field: 'comments', flex: 1, minWidth: 220 },
    { headerName: 'When', field: 'createdAt', valueFormatter: ({ value }) => formatDateTime(value as string), sort: 'desc' },
  ], [])

  return (
    <div className="page">
      <PageHeader eyebrow="Human gate" title="Approvals" description="Nothing is committed without a named human decision." />
      <section className="kpi-row kpi-row--4">
        <Kpi label="Plans waiting" value={pending.data?.length ?? 0} icon={ShieldCheck} tone="amber" loading={pending.isLoading} />
        <Kpi label="Proposals waiting" value={pendingProposals.length} icon={GitBranch} tone="purple" loading={proposals.isLoading} />
        <Kpi label="Approved" value={history.filter((h) => h.approved).length} icon={CheckCircle2} tone="green" loading={plans.isLoading} />
        <Kpi label="Rejected" value={history.filter((h) => !h.approved).length} icon={XCircle} tone="red" loading={plans.isLoading} />
      </section>
      {pending.isLoading ? (
        <LoadingSkeleton rows={2} height={160} />
      ) : pending.isError ? (
        <ErrorState error={pending.error} onRetry={() => void pending.refetch()} />
      ) : pending.data && pending.data.length > 0 ? (
        pending.data.map((approval) => <ApprovalCard key={approval.id} approval={approval} />)
      ) : (
        <Panel title="Awaiting decision" icon={ShieldCheck}>
          <EmptyState compact title="Inbox zero" description="Submitted plans appear here." />
        </Panel>
      )}
      {pendingProposals.map((proposal) => <ProposalApprovalCard key={proposal.id} proposal={proposal} />)}
      <Panel title="Approval history" icon={History}>
        <DataGrid rows={history} columns={historyCols} getRowId={(r) => r.id} loading={plans.isLoading} height={280} emptyMessage="No decisions yet" />
      </Panel>
    </div>
  )
}
