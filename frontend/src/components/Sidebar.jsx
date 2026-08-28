import { NavLink } from 'react-router-dom'
import {
  IconDashboard,
  IconHistory,
  IconReports,
  IconResults,
  IconScan,
  IconSettings,
} from './Icons'
import { useApp } from '../context/AppContext'

const links = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/scan', label: 'Scan Product', icon: IconScan },
  { to: '/results', label: 'Results', icon: IconResults },
  { to: '/reports', label: 'Reports', icon: IconReports },
  { to: '/history', label: 'History', icon: IconHistory },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

function Sidebar({ onNavigate }) {
  const { officerName, officeName } = useApp()

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <span></span>
          <span></span>
        </div>
        <div>
          <p className="brand-name">LegalMetrix</p>
          <p className="brand-tag">Compliance Checker</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
            >
              <Icon />
              <span>{link.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">{officerName.charAt(0)}</div>
        <div>
          <p className="sidebar-officer">{officerName}</p>
          <p className="sidebar-office">{officeName}</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
