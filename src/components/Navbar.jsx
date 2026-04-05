import { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import NotificationsDropdown from './NotificationsDropdown'

export default function Navbar() {
  const { session, profile } = useAuth()
  const { notifications, unreadCount, handleMarkRead, markAllAsRead } = useNotifications(session?.user?.id)
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  // Click Outside to Close
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const pages = [
    { path: '/feed', label: 'feed', icon: '📸' },
    { path: '/garage', label: 'garage', icon: '🚘' },
    { path: '/market', label: 'market', icon: '🛒' },
    { path: '/events', label: 'events', icon: '🏁' },
    { path: '/trending', label: 'trending', icon: '🔥' },
  ]

  return (
    <>
      <header className="top-header">
        <div className="logo">REV<span>UP</span></div>
        <div className="desktop-nav">
          {pages.map(p => (
            <NavLink
              key={p.path}
              to={p.path}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              {p.label}
            </NavLink>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          
          <div className="notif-bell-container" ref={notifRef} onClick={() => setShowNotifs(!showNotifs)}>
            <button className="notif-bell-btn">
              🔔
            </button>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </div>

          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div className="avatar" style={{ cursor: 'pointer' }}>
              {(profile?.full_name || profile?.username || session?.user?.email || '?')[0].toUpperCase()}
            </div>
          </Link>

          {showNotifs && (
            <NotificationsDropdown 
              notifications={notifications} 
              onMarkRead={handleMarkRead}
              onClose={() => setShowNotifs(false)}
            />
          )}

        </div>
      </header>

      <nav className="bottom-nav">
        {pages.map(p => (
          <NavLink
            key={p.path}
            to={p.path}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">{p.icon}</span>
            <span className="nav-label">{p.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
