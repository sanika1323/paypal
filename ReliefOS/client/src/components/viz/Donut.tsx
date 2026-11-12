import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { humanize } from '../../lib/format'
import { SERIES, STATUS_COLOR, tooltipStyle } from './palette'

export interface DonutDatum { name: string; value: number; color?: string }

/** Ring chart with a big centre figure and a compact legend. */
export function Donut({ data, label, value, size = 168 }: { data: DonutDatum[]; label: string; value?: string | number; size?: number }) {
  const rows = data.filter((d) => d.value > 0)
  const total = rows.reduce((s, d) => s + d.value, 0)
  const colour = (d: DonutDatum, i: number) => d.color ?? STATUS_COLOR[d.name] ?? SERIES[i % SERIES.length]
  return (
    <div className="donut">
      <div className="donut__chart" style={{ width: size, height: size }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={rows.length ? rows : [{ name: 'none', value: 1 }]} dataKey="value" innerRadius="72%" outerRadius="100%" paddingAngle={rows.length > 1 ? 2 : 0} stroke="none" isAnimationActive>
              {(rows.length ? rows : [{ name: 'none', value: 1 }]).map((d, i) => (
                <Cell key={d.name} fill={rows.length ? colour(d as DonutDatum, i) : 'rgba(148,163,184,0.15)'} />
              ))}
            </Pie>
            {rows.length > 0 && <Tooltip {...tooltipStyle} formatter={(v, n) => [v, humanize(String(n))]} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="donut__centre">
          <strong>{value ?? total}</strong>
          <span>{label}</span>
        </div>
      </div>
      <ul className="legend">
        {rows.map((d, i) => (
          <li key={d.name}>
            <i style={{ background: colour(d, i) }} />
            <span>{humanize(d.name)}</span>
            <b>{d.value}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}
