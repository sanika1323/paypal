import { humanize } from '../../lib/format'
import { toneForStatus, type Tone } from '../../lib/tone'

interface StatusBadgeProps {
  status: string
  tone?: Tone
  label?: string
  pulse?: boolean
}

export function StatusBadge({ status, tone, label, pulse = false }: StatusBadgeProps) {
  const resolved = tone ?? toneForStatus(status)
  return (
    <span className={`badge badge--${resolved}`}>
      <span className={`badge__dot${pulse ? ' badge__dot--pulse' : ''}`} aria-hidden="true" />
      {label ?? humanize(status)}
    </span>
  )
}
