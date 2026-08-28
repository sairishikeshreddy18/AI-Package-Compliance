import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { IconBell, IconClose, IconMenu, IconSearch } from './Icons'

function Topbar({ onMenu }) {
  const navigate = useNavigate()
  const { settings, searchQuery, setSearchQuery, notifications, setNotifications } = useApp()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('/history')
    }
  }

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <header className="topbar">
      <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <IconMenu />
      </button>

      <form className="search-box" onSubmit={handleSearchSubmit}>
        <IconSearch />
        <input
          type="search"
          placeholder="Search products, case IDs, violations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <IconClose />
          </button>
        )}
      </form>

      <div className="topbar-status-pill" title={`Engine Mode: ${settings.apiMode.toUpperCase()}`}>
        <span className={`status-indicator-dot ${settings.apiMode === 'live' ? 'live' : 'demo'}`} />
        <span className="topbar-mode-text">
          {settings.apiMode === 'live' ? 'Live OCR Backend' : 'Demo Engine'}
        </span>
      </div>

      <div className="topbar-notification-wrap">
        <button
          type="button"
          className="icon-btn notify-btn"
          aria-label="Notifications"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <IconBell />
          {notifications.length > 0 && <span className="notify-dot"></span>}
        </button>

        {showNotifications && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <strong>System Alerts & Notices</strong>
              <button
                type="button"
                className="text-link text-xs"
                onClick={() => setNotifications([])}
              >
                Clear all
              </button>
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">No active notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`notification-item ${notif.type || 'info'}`}>
                    <div className="notif-content">
                      <p className="notif-title">{notif.title}</p>
                      <p className="notif-text">{notif.text}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                    <button
                      type="button"
                      className="notif-dismiss"
                      onClick={() => dismissNotification(notif.id)}
                      aria-label="Dismiss"
                    >
                      <IconClose />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="topbar-user" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
        <div className="avatar">{settings.officerName ? settings.officerName.charAt(0) : 'A'}</div>
        <div className="topbar-user-text">
          <strong>{settings.officerName}</strong>
          <span>{settings.designation || 'Field Officer'}</span>
        </div>
      </div>
    </header>
  )
}

export default Topbar
