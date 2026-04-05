import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { session, profile } = useAuth()

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div className="avatar" style={{ cursor: 'pointer' }}>
              {(profile?.full_name || profile?.username || session.user.email)[0].toUpperCase()}
            </div>
          </Link>
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
