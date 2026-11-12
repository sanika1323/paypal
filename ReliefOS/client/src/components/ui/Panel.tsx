import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  icon?: LucideIcon
  iconTone?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  subtitle?: ReactNode
}

export function Panel({ title, icon: Icon, iconTone = 'blue', actions, children, className, subtitle }: PanelProps) {
  return (
    <section className={`panel${className ? ` ${className}` : ''}`}>
      <header className="panel__header">
        <div className="panel__title-wrap">
          {Icon && (
            <span className={`panel__icon tone-${iconTone}`}>
              <Icon size={18} />
            </span>
          )}
          <div>
            <h2 className="panel__title">{title}</h2>
            {subtitle && <p className="panel__subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="panel__actions">{actions}</div>}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  )
}
