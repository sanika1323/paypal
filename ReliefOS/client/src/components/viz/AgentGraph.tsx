import { BrainCircuit, CheckCircle2, UserCheck } from 'lucide-react'

import { AGENTS } from './agents'


const W = 640
const H = 364
const CX = W / 2
const CY = H / 2 + 6

const pos = (i: number) => {
  const a = (-90 + (360 / AGENTS.length) * i) * (Math.PI / 180)
  return { x: CX + Math.cos(a) * 235, y: CY + Math.sin(a) * 120 }
}

interface AgentGraphProps {
  /** Agent currently executing (replay or live run). */
  active?: string | null
  /** Step counts per agent in the selected workflow; >0 means the agent took part. */
  counts?: Record<string, number>
  /** Animate every edge (e.g. while a workflow request is in flight). */
  running?: boolean
  /** Workflow is waiting for a human decision. */
  waitingHuman?: boolean
  compact?: boolean
}

/** Orchestrator hub with the six specialist agents; edges light up for agents that ran. */
export function AgentGraph({ active, counts = {}, running, waitingHuman, compact }: AgentGraphProps) {
  return (
    <svg className={`agent-graph${compact ? ' agent-graph--compact' : ''}${running ? ' agent-graph--running' : ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Agent network">
      <defs>
        <radialGradient id="ag-hub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={CX} cy={CY} rx={235} ry={120} className="agent-graph__orbit" />
      {AGENTS.map((a, i) => {
        const p = pos(i)
        const on = running || (counts[a.id] ?? 0) > 0
        return (
          <line key={`e-${a.id}`} x1={CX} y1={CY} x2={p.x} y2={p.y}
            className={`agent-graph__edge${on ? ' agent-graph__edge--on' : ''}${active === a.id ? ' agent-graph__edge--active' : ''}`}
            style={{ stroke: on ? a.color : undefined, animationDelay: running ? `${i * 0.25}s` : undefined }} />
        )
      })}
      <circle cx={CX} cy={CY} r={70} fill="url(#ag-hub)" className={active === 'ORCHESTRATOR' || running ? 'agent-graph__halo agent-graph__halo--on' : 'agent-graph__halo'} />
      <g className="agent-graph__hub">
        <circle cx={CX} cy={CY} r={36} />
        <BrainCircuit x={CX - 13} y={CY - 19} width={26} height={26} color="#22d3ee" />
        <text x={CX} y={CY + 22} textAnchor="middle">Orchestrator</text>
      </g>
      {AGENTS.map((a, i) => {
        const p = pos(i)
        const n = counts[a.id] ?? 0
        const Icon = a.icon
        const state = active === a.id ? 'active' : n > 0 ? 'done' : 'idle'
        return (
          <g key={a.id} className={`agent-graph__node agent-graph__node--${state}`} style={{ color: a.color }}>
            <circle cx={p.x} cy={p.y} r={27} style={{ stroke: state === 'idle' ? undefined : a.color }} />
            <Icon x={p.x - 10} y={p.y - 10} width={20} height={20} color={state === 'idle' ? '#64748b' : a.color} />
            <text x={p.x} y={p.y + 44} textAnchor="middle">{a.label}</text>
            {n > 0 && (
              <g className="agent-graph__count">
                <circle cx={p.x + 21} cy={p.y - 19} r={10} style={{ fill: a.color }} />
                <text x={p.x + 21} y={p.y - 15} textAnchor="middle">{n}</text>
              </g>
            )}
          </g>
        )
      })}
      <g className={`agent-graph__human${waitingHuman || active === 'HUMAN' ? ' agent-graph__human--on' : ''}`}>
        <rect x={W - 128} y={10} width={118} height={30} rx={15} />
        {waitingHuman ? <UserCheck x={W - 118} y={17} width={16} height={16} color="#f59e0b" /> : <CheckCircle2 x={W - 118} y={17} width={16} height={16} color="#64748b" />}
        <text x={W - 98} y={30}>{waitingHuman ? 'Awaiting human' : 'Human gate'}</text>
      </g>
    </svg>
  )
}
