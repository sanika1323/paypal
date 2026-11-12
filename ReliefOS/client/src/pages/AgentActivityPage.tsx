import { useMutation } from '@tanstack/react-query'
import { BrainCircuit, Pause, Play, PlayCircle, Plug, Rocket, RotateCcw, Workflow as WorkflowIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EmergencySelect } from '../components/domain/EmergencySelect'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { AgentGraph } from '../components/viz/AgentGraph'
import { AGENTS } from '../components/viz/agents'
import { useAgentService, useMcpInfo, useProcurementPlans, useSupplierFailures, useVendors, useWorkflow, useWorkflows } from '../hooks/queries'
import { useCoordinator } from '../hooks/useCoordinator'
import { useInvalidateLive } from '../hooks/useInvalidateLive'
import { formatRelative, humanize } from '../lib/format'
import { STEP_KIND_TONE } from '../lib/tone'
import { getApiError } from '../services/api'
import { agentServiceApi } from '../services/endpoints'
import type { AgentStep } from '../types/platform'

const KIND_LABEL: Record<string, string> = {
  AI_REASONING: 'AI', MCP_TOOL: 'MCP tool', DETERMINISTIC: 'Rule', PERSISTED_MUTATION: 'Saved', SIMULATION: 'Simulation', HUMAN_ACTION: 'Human',
}
const LIVE_PLAN = new Set(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'COMPLETED'])
const AGENT_COLOR = Object.fromEntries(AGENTS.map((a) => [a.id, a.color]))

const preview = (v: unknown) => {
  if (v == null) return ''
  const t = JSON.stringify(v)
  return t.length > 160 ? `${t.slice(0, 160)}…` : t
}

/* ------------------------------------------------------------------ launcher */

function Launcher({ onStarted }: { onStarted: (id: string) => void }) {
  const { canAct } = useCoordinator()
  const invalidate = useInvalidateLive()
  const service = useAgentService()
  const plans = useProcurementPlans()
  const failures = useSupplierFailures()
  const vendors = useVendors()
  const [mode, setMode] = useState<'procurement' | 'replanning'>('procurement')
  const [emergencyId, setEmergencyId] = useState('')
  const [budget, setBudget] = useState('')
  const [planId, setPlanId] = useState('')
  const [source, setSource] = useState('')

  const run = useMutation({
    mutationFn: () => {
      if (mode === 'procurement') return agentServiceApi.runProcurement({ emergency_id: emergencyId, budget: Number(budget) })
      if (source.startsWith('sim:')) {
        return agentServiceApi.runReplanning({ plan_id: planId, simulation: { failure_type: 'SUPPLIER_UNAVAILABLE', vendor_id: source.slice(4), reason: 'What-if: supplier unavailable (Agent Studio)' } })
      }
      return agentServiceApi.runReplanning({ plan_id: planId, failure_event_id: source })
    },
    onSuccess: (state) => { invalidate(); if (state.workflow_id) onStarted(state.workflow_id) },
  })

  const ready = mode === 'procurement' ? emergencyId && Number(budget) > 0 : planId && source
  const submit = (e: FormEvent) => { e.preventDefault(); if (ready) run.mutate() }

  return (
    <Panel title="Launch" icon={Rocket} iconTone="cyan" className="panel--accent">
      <div className="segmented" role="tablist">
        <button type="button" className={mode === 'procurement' ? 'is-on' : ''} onClick={() => setMode('procurement')}>Procurement</button>
        <button type="button" className={mode === 'replanning' ? 'is-on' : ''} onClick={() => setMode('replanning')}>Failure recovery</button>
      </div>
      <form className="stack" onSubmit={submit}>
        {mode === 'procurement' ? (
          <>
            <EmergencySelect value={emergencyId} onChange={setEmergencyId} />
            <label className="field"><span>Budget (INR)</span><input type="number" min="1" value={budget} onChange={(e) => setBudget(e.target.value)} /></label>
          </>
        ) : (
          <>
            <label className="field">
              <span>Plan</span>
              <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
                <option value="">Select a plan</option>
                {(plans.data ?? []).filter((p) => LIVE_PLAN.has(p.status)).map((p) => <option key={p.id} value={p.id}>{p.name} · {humanize(p.status)}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Failure</span>
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="">Select a failure</option>
                <optgroup label="Reported failures">
                  {(failures.data ?? []).filter((f) => !f.isSimulation).slice(0, 20).map((f) => <option key={f.id} value={f.id}>{humanize(f.type)} · {f.vendor.name}</option>)}
                </optgroup>
                <optgroup label="Simulate supplier unavailable">
                  {(vendors.data ?? []).map((v) => <option key={v.id} value={`sim:${v.id}`}>What-if: {v.name}</option>)}
                </optgroup>
              </select>
            </label>
          </>
        )}
        <button type="submit" className="btn btn--glow" disabled={!ready || !canAct || run.isPending || service.isError}>
          <BrainCircuit size={16} /> {run.isPending ? 'Agents working…' : 'Run agents'}
        </button>
      </form>
      {service.isError && <p className="muted small">Agent service offline · <code>uvicorn app.main:app --port 8001</code></p>}
      {!canAct && <p className="muted small">Sign in as coordinator to launch.</p>}
      {run.isError && <div className="inline-error">{getApiError(run.error)}</div>}
      {run.isPending && <AgentGraph running compact />}
    </Panel>
  )
}

/* ------------------------------------------------------------------ studio */

export function AgentActivityPage() {
  const workflows = useWorkflows()
  const service = useAgentService()
  const mcp = useMcpInfo()
  const [params, setParams] = useSearchParams()
  const selected = params.get('workflow') ?? workflows.data?.[0]?.id ?? null
  const wf = useWorkflow(selected)
  const invalidate = useInvalidateLive()
  const { canAct } = useCoordinator()
  const resume = useMutation({ mutationFn: () => agentServiceApi.resume(selected!), onSuccess: () => { invalidate(); void wf.refetch() } })

  const steps = useMemo(() => wf.data?.steps ?? [], [wf.data])
  const [replay, setReplay] = useState<{ id: string | null; cursor: number | null; playing: boolean }>({ id: null, cursor: null, playing: false })
  const mine = replay.id === selected
  const cursor = mine ? replay.cursor : null
  const playing = mine && replay.playing
  const setCursor = (c: number | null) => setReplay((r) => ({ id: selected, cursor: c, playing: c === null ? false : r.id === selected && r.playing }))
  const togglePlay = () => setReplay((r) => (r.id === selected ? { ...r, cursor: r.cursor ?? -1, playing: !r.playing } : { id: selected, cursor: -1, playing: true }))

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setReplay((r) => {
        const next = (r.cursor ?? -1) + 1
        return next >= steps.length ? { ...r, cursor: null, playing: false } : { ...r, cursor: next }
      })
    }, 650)
    return () => clearInterval(t)
  }, [playing, steps.length])

  const visible = cursor === null ? steps : steps.slice(0, cursor + 1)
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of visible) c[s.agent] = (c[s.agent] ?? 0) + 1
    return c
  }, [visible])
  const current: AgentStep | undefined = cursor !== null ? steps[cursor] : undefined
  const w = wf.data
  const tools = Object.entries(mcp.data?.tools ?? {})
  const byDomain = tools.reduce<Record<string, typeof tools>>((acc, t) => ({ ...acc, [t[1].domain]: [...(acc[t[1].domain] ?? []), t] }), {})

  return (
    <div className="page">
      <PageHeader eyebrow="Python agents · MCP" title="Agent Studio" description="Six specialist agents, one orchestrator, a human gate."
        actions={
          <span className={`live-pill${service.isError ? ' live-pill--off' : ''}`}><i />{service.isError ? 'Service offline' : `${service.data?.mcpTools ?? '…'} MCP tools`}</span>
        } />

      <div className="grid-studio">
        <Panel title={w ? `${humanize(w.type)} run` : 'Agent network'} icon={BrainCircuit} iconTone="purple" className="panel--stage"
          subtitle={w ? `${humanize(w.checkpoint ?? 'started')} · ${formatRelative(w.createdAt)}` : undefined}
          actions={w && steps.length > 0 && (
            <div className="tag-row">
              <button type="button" className="btn btn--ghost btn--sm" onClick={togglePlay}>
                {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pause' : 'Replay'}
              </button>
              {cursor !== null && <button type="button" className="icon-btn" aria-label="Show all steps" onClick={() => setCursor(null)}><RotateCcw size={14} /></button>}
            </div>
          )}>
          <AgentGraph counts={counts} active={current?.agent ?? null} waitingHuman={w?.status === 'WAITING_FOR_HUMAN'} />
          <div className="stage-caption">
            {current ? (
              <>
                <span className="kind-chip" style={{ color: AGENT_COLOR[current.agent] }}>{humanize(current.agent)}</span>
                <StatusBadge status={current.kind} tone={STEP_KIND_TONE[current.kind]} label={KIND_LABEL[current.kind]} />
                {current.tool && <code>{current.tool}</code>}
                <span className="muted">{current.durationMs} ms</span>
              </>
            ) : w ? (
              <>
                <StatusBadge status={w.status} pulse={w.status === 'RUNNING' || w.status === 'WAITING_FOR_HUMAN'} />
                <span className="muted">{w.state.error?.message ?? w.state.next_action}</span>
                {w.status === 'WAITING_FOR_HUMAN' && (
                  <button type="button" className="btn btn--primary btn--sm" disabled={!canAct || resume.isPending} onClick={() => resume.mutate()}>
                    <PlayCircle size={14} /> {resume.isPending ? 'Checking…' : 'Resume'}
                  </button>
                )}
              </>
            ) : <span className="muted">Launch a run to see the agents work.</span>}
          </div>
          {resume.isError && <div className="inline-error">{getApiError(resume.error)}</div>}
        </Panel>
        <Launcher onStarted={(id) => setParams({ workflow: id })} />
      </div>

      <div className="grid-runs">
        <Panel title="Runs" icon={WorkflowIcon} subtitle={`${workflows.data?.length ?? 0} recorded`}>
          {workflows.isError ? <ErrorState compact error={workflows.error} /> : workflows.isLoading ? <LoadingSkeleton rows={5} /> : (workflows.data ?? []).length === 0 ? (
            <EmptyState compact title="No runs yet" />
          ) : (
            <ul className="runlist">
              {(workflows.data ?? []).map((r) => (
                <li key={r.id}>
                  <button type="button" className={r.id === selected ? 'is-on' : ''} onClick={() => setParams({ workflow: r.id })}>
                    <span className={`runlist__dot runlist__dot--${r.status.toLowerCase()}`} />
                    <span className="runlist__main">
                      <strong>{humanize(r.type)}{r.isSimulation ? ' · sim' : ''}</strong>
                      <small>{humanize(r.checkpoint ?? 'started')}</small>
                    </span>
                    <time>{formatRelative(r.createdAt)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Trace" icon={Play} iconTone="cyan" subtitle={w ? `${steps.length} steps` : undefined}>
          {!selected ? <EmptyState compact title="Select a run" /> : wf.isLoading ? <LoadingSkeleton rows={6} /> : wf.isError ? <ErrorState compact error={wf.error} /> : w ? (
            <div className="stack">
              {w.state.attempts.length > 0 && (
                <div className="attempts">
                  {w.state.attempts.map((a) => (
                    <div key={a.attempt} className="attempt">
                      <span className="muted">#{a.attempt} {humanize(a.mode)}</span>
                      <span>Agent <StatusBadge status={a.agentOutcome} /></span>
                      <span>Server <StatusBadge status={a.serverOutcome} /></span>
                    </div>
                  ))}
                </div>
              )}
              <ol className="trace">
                {steps.map((s, i) => (
                  <li key={s.id} className={`trace__step${cursor !== null && i > cursor ? ' trace__step--future' : ''}${cursor === i ? ' trace__step--now' : ''}${s.status === 'FAILED' ? ' trace__step--failed' : ''}`}
                    style={{ ['--agent' as string]: AGENT_COLOR[s.agent] ?? '#94a3b8' }}>
                    <span className="trace__seq">{s.sequence}</span>
                    <div>
                      <div className="tag-row">
                        <strong>{humanize(s.agent)}</strong>
                        <StatusBadge status={s.kind} tone={STEP_KIND_TONE[s.kind]} label={KIND_LABEL[s.kind] ?? s.kind} />
                        {s.tool && <code>{s.tool}</code>}
                        <span className="muted small">{s.durationMs} ms{s.attempt && s.attempt > 1 ? ` · retry ${s.attempt}` : ''}</span>
                      </div>
                      {s.error ? <p className="tone-red small">{s.error}</p> : s.outputSummary != null && <p className="mono trace__out">{preview(s.outputSummary)}</p>}
                    </div>
                  </li>
                ))}
              </ol>
              <div className={`explain${w.state.explanation?.available ? ' explain--on' : ''}`}>
                <BrainCircuit size={15} />
                {w.state.explanation?.available ? <p>{w.state.explanation.text}</p> : <span className="muted">AI explanation unavailable · decisions above come from tools and rules</span>}
              </div>
            </div>
          ) : null}
        </Panel>
      </div>

      <Panel title="MCP server" icon={Plug} iconTone="blue" subtitle={mcp.data ? `${mcp.data.endpoint} · ${mcp.data.transport} · ${mcp.data.auth}` : 'Offline'}>
        {tools.length === 0 ? <p className="muted">Tool list unavailable while the agent service is offline.</p> : (
          <div className="tool-groups">
            {Object.entries(byDomain).map(([domain, list]) => (
              <div key={domain}>
                <h4>{humanize(domain)}</h4>
                <div className="tag-row">
                  {list.map(([name, meta]) => <span key={name} className={`tag${meta.scope === 'write' ? ' tag--amber' : ''}`} title={meta.title}>{name}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
