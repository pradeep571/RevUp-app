import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { session, logout } = useAuth()

  const pages = [
    { path: '/feed', label: 'feed' },
    { path: '/garage', label: 'garage' },
    { path: '/market', label: 'market' },
    { path: '/events', label: 'events' },
    { path: '/trending', label: 'trending' },
  ]

  return (
    <nav className="navbar">
      <div className="logo">REV<span>UP</span></div>
      <div className="nav-links">
        {pages.map(p => (
          <NavLink
            key={p.path}
            to={p.path}
            className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}
          >
            {p.label}
          </NavLink>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="avatar">{session.user.email[0].toUpperCase()}</div>
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#72727a',
            fontSize: '12px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontFamily: 'Inter,sans-serif',
            transition: 'all .2s',
          }}
        >
          Log out
        </button>
      </div>
    </nav>
  )
}
