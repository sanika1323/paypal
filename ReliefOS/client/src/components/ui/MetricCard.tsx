import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import type { Tone } from '../../lib/tone'

interface MetricCardProps {
  label: string
  value: ReactNode
  icon: LucideIcon
  tone: Tone
  /** Secondary fact derived from real data. Omit when nothing honest can be said. */
  detail?: ReactNode
  /** Small visual derived from real data (e.g. a progress bar). */
  footer?: ReactNode
  to?: string
  loading?: boolean
}

export function MetricCard({ label, value, icon: Icon, tone, detail, footer, to, loading }: MetricCardProps) {
  const body = (
    <>
      <div className="metric__glow" aria-hidden="true" />
      <div className="metric__icon">
        <Icon size={26} strokeWidth={2} />
      </div>
      <div className="metric__body">
        <span className="metric__label">{label}</span>
        {loading ? (
          <span className="skeleton skeleton--metric" aria-label="Loading" />
        ) : (
          <span className="metric__value">{value}</span>
        )}
        {detail && !loading && <span className="metric__detail">{detail}</span>}
      </div>
      {footer && !loading && <div className="metric__footer">{footer}</div>}
    </>
  )

  return to ? (
    <Link to={to} className={`metric metric--${tone} metric--link`}>
      {body}
    </Link>
  ) : (
    <article className={`metric metric--${tone}`}>{body}</article>
  )
}
