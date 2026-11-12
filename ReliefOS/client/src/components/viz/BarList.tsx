import type { ReactNode } from 'react'

export interface BarRow { key: string; label: ReactNode; value: number; display?: ReactNode; color?: string; hint?: ReactNode; highlight?: boolean }

/** Horizontal bars scaled to the largest value; light enough to use anywhere. */
export function BarList({ rows, max }: { rows: BarRow[]; max?: number }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="barlist">
      {rows.map((r) => (
        <li key={r.key} className={r.highlight ? 'barlist__row barlist__row--hl' : 'barlist__row'}>
          <div className="barlist__head">
            <span>{r.label}</span>
            <b>{r.display ?? r.value}</b>
          </div>
          <div className="barlist__track">
            <span style={{ width: `${(Math.max(0, r.value) / top) * 100}%`, background: r.color }} />
          </div>
          {r.hint && <small>{r.hint}</small>}
        </li>
      ))}
    </ul>
  )
}
