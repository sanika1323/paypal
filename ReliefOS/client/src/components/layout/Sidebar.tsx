import { NavLink } from 'react-router-dom'

import { useEmergencies, usePendingApprovals, useProposals, useWorkflows } from '../../hooks/queries'
import { Logo } from './Logo'
import { NAV_ITEMS, NAV_SECTIONS, type NavBadgeSource } from './navigation'
import { useConnection } from './useConnection'

interface SidebarProps {
  open: boolean
  onNavigate: () => void
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const emergencies = useEmergencies()
  const approvals = usePendingApprovals()
  const proposals = useProposals()
  const workflows = useWorkflows()
  const connection = useConnection()

  const badgeValue = (source: NavBadgeSource): number | null => {
    if (source === 'activeEmergencies') {
      return emergencies.data ? emergencies.data.filter((item) => item.isActive).length : null
    }
    if (source === 'activeWorkflows') {
      return workflows.data ? workflows.data.filter((w) => w.status === 'WAITING_FOR_HUMAN').length : null
    }
    if (!approvals.data) return null
    return approvals.data.length + (proposals.data ?? []).filter((p) => p.status === 'PENDING_APPROVAL').length
  }

  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`} aria-label="Primary">
      <div className="sidebar__brand">
        <Logo />
        <div>
          <div className="sidebar__name">ReliefOS</div>
          <div className="sidebar__tagline">Humanitarian procurement</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section} className="sidebar__section">
            <span className="sidebar__heading">{section}</span>
            {NAV_ITEMS.filter((item) => item.section === section).map(({ to, label, icon: Icon, badge }) => {
              const count = badge ? badgeValue(badge) : null
              return (
                <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate} className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
                  <Icon size={17} strokeWidth={2} />
                  <span>{label}</span>
                  {count !== null && count > 0 && <span className={`nav-link__badge nav-link__badge--${badge}`}>{count}</span>}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className={`system-status system-status--${connection.state}`}>
        <span className="system-status__dot" aria-hidden="true" />
        <div>
          <div className="system-status__title">{connection.title}</div>
          <div className="system-status__detail">{connection.detail}</div>
        </div>
      </div>
    </aside>
  )
}
