import { AlertTriangle, Inbox, RefreshCw, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { getApiError } from '../../services/api'

interface EmptyStateProps {
  title: string
  description?: ReactNode
  icon?: LucideIcon
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({ title, description, icon: Icon = Inbox, action, compact }: EmptyStateProps) {
  return (
    <div className={`state state--empty${compact ? ' state--compact' : ''}`}>
      <span className="state__icon">
        <Icon size={compact ? 20 : 26} />
      </span>
      <p className="state__title">{title}</p>
      {description && <p className="state__text">{description}</p>}
      {action}
    </div>
  )
}

interface ErrorStateProps {
  error: unknown
  title?: string
  onRetry?: () => void
  retrying?: boolean
  compact?: boolean
}

export function ErrorState({ error, title = 'Could not load data', onRetry, retrying, compact }: ErrorStateProps) {
  return (
    <div className={`state state--error${compact ? ' state--compact' : ''}`} role="alert">
      <span className="state__icon">
        <AlertTriangle size={compact ? 20 : 26} />
      </span>
      <p className="state__title">{title}</p>
      <p className="state__text">{getApiError(error)}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry} disabled={retrying}>
          <RefreshCw size={14} className={retrying ? 'spin' : undefined} />
          {retrying ? 'Retrying…' : 'Retry'}
        </button>
      )}
    </div>
  )
}

export function LoadingSkeleton({ rows = 3, height = 44 }: { rows?: number; height?: number }) {
  return (
    <div className="skeleton-stack" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} className="skeleton" style={{ height }} />
      ))}
    </div>
  )
}
