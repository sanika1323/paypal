import { Bell, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { usePendingApprovals } from '../../hooks/queries'
import { formatINR, formatRelative } from '../../lib/format'

// The backend has no notification API. The only real actionable items are
// procurement plans waiting for human approval (GET /api/approvals).
export function Notifications() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const approvals = usePendingApprovals()
  const items = approvals.data ?? []

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="popover-wrap" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn icon-btn--lg"
        aria-label={items.length ? `${items.length} plans awaiting approval` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={20} />
        {items.length > 0 && <span className="icon-btn__count">{items.length}</span>}
      </button>
      {open && (
        <div className="popover" role="dialog" aria-label="Pending approvals">
          <div className="popover__title">Awaiting human approval</div>
          {approvals.isLoading ? (
            <p className="popover__empty">Loading…</p>
          ) : approvals.isError ? (
            <p className="popover__empty">Could not load approvals.</p>
          ) : items.length === 0 ? (
            <p className="popover__empty">Nothing needs your attention.</p>
          ) : (
            <ul className="popover__list">
              {items.map((approval) => (
                <li key={approval.id}>
                  <Link to="/approvals" className="popover__item" onClick={() => setOpen(false)}>
                    <ShieldCheck size={16} className="tone-amber" />
                    <span>
                      <strong>{approval.plan.name}</strong>
                      <small>
                        {formatINR(approval.plan.totalCost)} · submitted {formatRelative(approval.createdAt)}
                      </small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
