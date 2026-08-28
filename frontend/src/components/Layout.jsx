import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={sidebarOpen ? 'app-shell sidebar-open' : 'app-shell'}>
      <Sidebar onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen ? (
        <button
          type="button"
          className="backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <div className="app-content">
        <Topbar onMenu={() => setSidebarOpen((open) => !open)} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
