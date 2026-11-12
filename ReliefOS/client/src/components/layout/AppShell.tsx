import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="shell">
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
      {navOpen && (
        <button type="button" className="shell__scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} />
      )}
      <div className="shell__main">
        <Header onMenu={() => setNavOpen(true)} />
        <main className="shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
