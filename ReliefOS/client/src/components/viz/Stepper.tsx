import { Check, X } from 'lucide-react'

export interface Step { label: string; state: 'done' | 'current' | 'todo' | 'failed'; note?: string }

/** Horizontal lifecycle stepper (plan, payment, delivery). */
export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <ol className="stepper">
      {steps.map((s, i) => (
        <li key={s.label} className={`stepper__step stepper__step--${s.state}`}>
          <span className="stepper__dot">{s.state === 'done' ? <Check size={12} /> : s.state === 'failed' ? <X size={12} /> : i + 1}</span>
          <span className="stepper__label">{s.label}</span>
          {s.note && <small>{s.note}</small>}
        </li>
      ))}
    </ol>
  )
}
