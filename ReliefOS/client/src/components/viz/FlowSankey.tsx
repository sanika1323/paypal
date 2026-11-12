import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'
import type { NodeProps as RechartsNodeProps } from 'recharts/types/chart/Sankey'

import { tooltipStyle } from './palette'

export interface FlowNode { name: string; kind: 'ngo' | 'product' | 'supplier' | 'gap' }
export interface FlowLink { source: number; target: number; value: number }

const KIND_COLOR: Record<FlowNode['kind'], string> = { ngo: '#22d3ee', product: '#8b5cf6', supplier: '#3b82f6', gap: '#ef4444' }

interface NodeProps { x: number; y: number; width: number; height: number; index: number; payload: FlowNode & { value: number } }

function FlowNodeShape({ x, y, width, height, payload }: NodeProps) {
  const colour = KIND_COLOR[payload.kind]
  const right = payload.kind !== 'ngo'
  return (
    <g>
      <rect x={x} y={y} width={width} height={Math.max(height, 2)} rx={3} fill={colour} fillOpacity={0.9} style={{ filter: `drop-shadow(0 0 6px ${colour}99)` }} />
      <text x={right ? x + width + 8 : x - 8} y={y + height / 2} dy={4} textAnchor={right ? 'start' : 'end'} className="sankey__label">
        {payload.name} <tspan className="sankey__value">{payload.value.toLocaleString('en-IN')}</tspan>
      </text>
    </g>
  )
}

/** NGO requests → collective product demand → supplier purchases (and any unmet gap). */
export function FlowSankey({ nodes, links, height = 300 }: { nodes: FlowNode[]; links: FlowLink[]; height?: number }) {
  const valid = links.filter((l) => l.value > 0)
  if (valid.length === 0) return null
  return (
    <div className="sankey">
      <ResponsiveContainer width="100%" height={height}>
        <Sankey
          data={{ nodes, links: valid }}
          nodeWidth={10}
          nodePadding={22}
          margin={{ top: 12, right: 200, bottom: 12, left: 200 }}
          link={{ stroke: 'url(#sankey-link)', strokeOpacity: 0.35 }}
          node={(props: RechartsNodeProps) => <FlowNodeShape {...(props as unknown as NodeProps)} />}
        >
          <defs>
            <linearGradient id="sankey-link" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <Tooltip {...tooltipStyle} />
        </Sankey>
      </ResponsiveContainer>
    </div>
  )
}
