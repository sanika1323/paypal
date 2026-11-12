import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import type { Tone } from '../../lib/tone'

interface KpiProps {
  label: string
  value: ReactNode
  icon: LucideIcon
  tone?: Tone
  sub?: ReactNode
  /** 0..1, drawn as a thin progress line */
  progress?: number
  to?: string
  loading?: boolean
}

export function Kpi({ label, value, icon: Icon, tone = 'cyan', sub, progress, to, loading }: KpiProps) {
  const body = (
    <>
      <div className="kpi__top">
        <span className="kpi__icon"><Icon size={16} /></span>
        <span className="kpi__label">{label}</span>
      </div>
      {loading ? <span className="skeleton kpi__skeleton" /> : <strong className="kpi__value">{value}</strong>}
      {sub && !loading && <span className="kpi__sub">{sub}</span>}
      {progress !== undefined && !loading && (
        <span className="kpi__progress"><span style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} /></span>
      )}
    </>
  )
  return to ? <Link to={to} className={`kpi kpi--${tone} kpi--link`}>{body}</Link> : <article className={`kpi kpi--${tone}`}>{body}</article>
}
