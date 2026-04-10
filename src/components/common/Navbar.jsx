import { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationsDropdown from '../notifications/NotificationsDropdown'
import Toast from './Toast'

export default function Navbar() {
  const { session, profile, isAdmin } = useAuth()
  const [activeToast, setActiveToast] = useState(null)
  
  const { notifications, unreadCount, handleMarkRead, markAllAsRead, handleDelete } = useNotifications(
    session?.user?.id,
    (newNotif) => setActiveToast(newNotif)
  )
  
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
    { path: '/messages', label: 'messages', icon: '💬' },
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
          {isAdmin && (
            <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '12px', fontWeight: 'bold' }}>
              ADMIN
            </Link>
          )}
          <div className="notif-wrapper" ref={notifRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div className="notif-bell-container" onClick={() => setShowNotifs(!showNotifs)}>
              <button className="notif-bell-btn">
                🔔
              </button>
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </div>

            {showNotifs && (
              <NotificationsDropdown 
                notifications={notifications} 
                onMarkRead={handleMarkRead}
                onMarkAllRead={markAllAsRead}
                onDelete={handleDelete}
                onClose={() => setShowNotifs(false)}
              />
            )}
          </div>

          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div className="avatar" style={{ cursor: 'pointer' }}>
              {(profile?.full_name || profile?.username || session?.user?.email || '?')[0].toUpperCase()}
            </div>
          </Link>

        </div>
      </header>

      {activeToast && (
        <Toast 
          notification={activeToast} 
          onClose={() => setActiveToast(null)} 
        />
      )}

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
