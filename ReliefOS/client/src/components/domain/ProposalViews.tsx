import { ArrowRight, Clock, Truck } from 'lucide-react'

import { StatusBadge } from '../ui/StatusBadge'
import { Ring } from '../viz/Ring'
import { C } from '../viz/palette'
import { formatDateTime, formatINR, formatNumber, humanize, toNumber } from '../../lib/format'
import type { ComparisonLine, PlanComparison, ReplanningProposal, ValidationCheck, ValidationReport } from '../../types/platform'

function Lines({ title, lines, tone }: { title: string; lines: ComparisonLine[]; tone: 'old' | 'new' }) {
  return (
    <div className={`lines lines--${tone}`}>
      <h4>{title}</h4>
      {lines.length === 0 ? <p className="muted small">No lines</p> : lines.map((l) => (
        <div key={`${tone}-${l.offerId}`} className="lines__row">
          <strong>{l.vendorName}</strong>
          <span className="muted">{formatNumber(l.quantity)} × {formatINR(l.unitPrice)}</span>
          <b>{formatINR(l.lineTotal)}</b>
          <span className="muted small"><Truck size={12} /> {l.deliveryDays}d</span>
        </div>
      ))}
    </div>
  )
}

/** Original vs revised: cost bars, supplier swap, delivery time and line items. */
export function ComparisonView({ comparison }: { comparison: PlanComparison }) {
  const original = toNumber(comparison.originalCost) ?? 0
  const revised = toNumber(comparison.revisedCost) ?? 0
  const delta = toNumber(comparison.costDelta) ?? 0
  const top = Math.max(original, revised, 1)
  return (
    <div className="compare-plan">
      <div className="costbars">
        <div className="costbars__row">
          <span>Original</span>
          <i><b style={{ width: `${(original / top) * 100}%`, background: '#475569' }} /></i>
          <strong>{formatINR(original)}</strong>
        </div>
        <div className="costbars__row">
          <span>Revised</span>
          <i><b style={{ width: `${(revised / top) * 100}%` }} /></i>
          <strong>{formatINR(revised)}</strong>
        </div>
        <div className="costbars__delta">
          <span className={delta > 0 ? 'tone-red' : delta < 0 ? 'tone-green' : 'muted'}>{delta > 0 ? '+' : ''}{formatINR(delta)}</span>
          <span className="muted">{comparison.revisedCoverage}% coverage</span>
          <span className="muted"><Clock size={12} /> {comparison.originalMaxDeliveryDays ?? '—'}d <ArrowRight size={11} /> {comparison.revisedMaxDeliveryDays ?? '—'}d</span>
          <span className="muted">{comparison.scope}</span>
        </div>
      </div>
      <div className="swap">
        <div className="swap__side">
          {comparison.originalSuppliers.map((v) => <span key={v} className={`chip${comparison.suppliersRemoved.includes(v) ? ' chip--out' : ''}`}>{v}</span>)}
        </div>
        <ArrowRight size={18} className="swap__arrow" />
        <div className="swap__side">
          {comparison.revisedSuppliers.map((v) => <span key={v} className={`chip${comparison.suppliersAdded.includes(v) ? ' chip--in' : ''}`}>{v}</span>)}
        </div>
      </div>
      <div className="two-col">
        <Lines title="Original" lines={comparison.originalLines} tone="old" />
        <Lines title="Revised" lines={comparison.revisedLines} tone="new" />
      </div>
    </div>
  )
}

function Checks({ checks }: { checks: ValidationCheck[] }) {
  return (
    <ul className="checks">
      {checks.map((c, i) => (
        <li key={`${c.code}-${i}`} className={`checks__item checks__item--${c.status.toLowerCase()}`} title={c.message}>
          <i />
          <code>{c.code}</code>
          <span>{c.message}</span>
        </li>
      ))}
    </ul>
  )
}

export function ValidationView({ report }: { report: ValidationReport }) {
  const server = report.checks.server ?? []
  const agent = report.checks.agent ?? []
  const passed = server.filter((c) => c.status !== 'FAIL').length
  const failed = server.some((c) => c.status === 'FAIL')
  return (
    <div className="validation">
      <div className="validation__head">
        <Ring value={passed} max={Math.max(1, server.length)} label={`${passed}/${server.length}`} sub="checks" color={failed ? C.red : C.green} size={96} />
        <div className="stack stack--tight">
          <div className="tag-row"><span className="muted">Result</span><StatusBadge status={report.outcome} /></div>
          {report.agentOutcome && <div className="tag-row"><span className="muted">Agent</span><StatusBadge status={report.agentOutcome} /></div>}
          <span className="muted small">{report.validator} · {formatDateTime(report.createdAt)}</span>
          {report.agentOutcome && report.agentOutcome !== report.outcome && <span className="tone-amber small">Agent and server disagree — human review</span>}
        </div>
      </div>
      <div className="two-col">
        <div><h4 className="subhead">Server · fresh data</h4><Checks checks={server} /></div>
        <div><h4 className="subhead">Revalidation agent</h4>{agent.length ? <Checks checks={agent} /> : <p className="muted small">No agent findings (server-only validation)</p>}</div>
      </div>
    </div>
  )
}

export function ProposalHeader({ proposal }: { proposal: ReplanningProposal }) {
  return (
    <div className="tag-row">
      <StatusBadge status={proposal.status} />
      <StatusBadge status={proposal.mode} />
      {proposal.isSimulation && <StatusBadge status="SIMULATION" tone="amber" label="Simulation" />}
      <span className="muted small">
        {proposal.sourcePlan?.name ?? proposal.sourcePlanId} v{proposal.sourcePlanVersion}
        {proposal.failureEvent && <> · {humanize(proposal.failureEvent.type)} · {proposal.failureEvent.vendor.name}</>}
        {' '}· {formatDateTime(proposal.createdAt)}
      </span>
    </div>
  )
}
