/** Animated SVG progress ring. `value` and `max` in the same unit. */
export function Ring({ value, max, label, sub, color = '#22d3ee', size = 112 }: { value: number; max: number; label: string; sub?: string; color?: string; size?: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0
  const r = 44
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} className="ring__track" />
        <circle cx="50" cy="50" r={r} className="ring__bar" stroke={color} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div className="ring__centre">
        <strong>{label}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  )
}
