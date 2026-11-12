import { Menu, RefreshCw } from 'lucide-react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'

import { CoordinatorSignIn } from '../auth/CoordinatorSignIn'
import { GlobalSearch } from './GlobalSearch'
import { Notifications } from './Notifications'
import { useConnection } from './useConnection'

export function Header({ onMenu }: { onMenu: () => void }) {
  const connection = useConnection()
  const queryClient = useQueryClient()
  const fetching = useIsFetching() > 0

  return (
    <header className="topbar">
      <button type="button" className="icon-btn topbar__menu" onClick={onMenu} aria-label="Open navigation">
        <Menu size={20} />
      </button>
      <GlobalSearch />
      <div className="topbar__actions">
        <span className={`conn-pill conn-pill--${connection.state}`} title={connection.detail}>
          <span className="conn-pill__dot" aria-hidden="true" />
          <span className="conn-pill__text">{connection.title}</span>
        </span>
        <button
          type="button"
          className="icon-btn icon-btn--lg"
          onClick={() => void queryClient.invalidateQueries()}
          aria-label="Refresh all live data"
          title="Refresh all live data"
        >
          <RefreshCw size={19} className={fetching ? 'spin' : undefined} />
        </button>
        <Notifications />
        <CoordinatorSignIn />
      </div>
    </header>
  )
}
