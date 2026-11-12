import { NavLink } from 'react-router-dom'

import { useEmergencies, usePendingApprovals } from '../../hooks/queries'
import { Logo } from './Logo'
import { NAV_ITEMS, type NavBadgeSource } from './navigation'
import { useConnection } from './useConnection'

interface SidebarProps {
  open: boolean
  onNavigate: () => void
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const emergencies = useEmergencies()
  const approvals = usePendingApprovals()
  const connection = useConnection()

  const badgeValue = (source: NavBadgeSource): number | null => {
    if (source === 'activeEmergencies') {
      return emergencies.data ? emergencies.data.filter((item) => item.isActive).length : null
    }
    return approvals.data ? approvals.data.length : null
  }

  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`} aria-label="Primary">
      <div className="sidebar__brand">
        <Logo />
        <div>
          <div className="sidebar__name">ReliefOS</div>
          <div className="sidebar__tagline">Collective emergency procurement</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => {
          const count = badge ? badgeValue(badge) : null
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onNavigate}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{label}</span>
              {count !== null && count > 0 && (
                <span className={`nav-link__badge nav-link__badge--${badge}`}>{count}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className={`system-status system-status--${connection.state}`}>
        <span className="system-status__dot" aria-hidden="true" />
        <div>
          <div className="system-status__title">{connection.title}</div>
          <div className="system-status__detail">{connection.detail}</div>
        </div>
      </div>
      <div className="sidebar__wave" aria-hidden="true" />
    </aside>
  )
}
