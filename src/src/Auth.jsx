import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'
import Auth from './Auth'

// ── paste the rest of your existing App.jsx below this line ──
// ── then replace the export default function App() with this ──

export default function App() {
  const [page, setPage] = useState('feed')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const pages = ['feed', 'garage', 'market', 'events', 'trending']

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    // Listen for login / logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setPage('feed')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#08080a' }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '32px', color: '#f0c040', letterSpacing: '2px' }}>
          REV<span style={{ color: '#ff4d2e' }}>UP</span>
        </div>
      </div>
    )
  }

  if (!session) return <Auth />

  return (
    <div>
      <nav className="navbar">
        <div className="logo">REV<span>UP</span></div>
        <div className="nav-links">
          {pages.map(p => (
            <button
              key={p}
              className={page === p ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar">{session.user.email[0].toUpperCase()}</div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#72727a', fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
          >
            Log out
          </button>
        </div>
      </nav>

      {page === 'feed' && <FeedPage />}
      {page === 'garage' && <GaragePage />}
      {page === 'market' && <MarketplacePage />}
      {page === 'events' && <EventsPage />}
      {page === 'trending' && <TrendingPage />}
    </div>
  )
}


export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true); setError(''); setSuccess('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleSignup() {
    if (!email || !password || !username) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError(''); setSuccess('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.toLowerCase().replace(/\s/g, '_'),
        full_name: username,
        location: 'Bangalore',
      })
      if (profileError) setError(profileError.message)
      else setSuccess('Account created! Check your email to confirm, then log in.')
    }
    setLoading(false)
  }

  async function handleReset() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true); setError(''); setSuccess('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setError(error.message)
    else setSuccess('Password reset email sent! Check your inbox.')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-emoji">🏎️</div>
        <div className="auth-bg-emoji">🚗</div>
        <div className="auth-bg-emoji">⚡</div>
        <div className="auth-bg-emoji">🏁</div>
      </div>

      <div className="auth-box">
        <div className="auth-logo">REV<span>UP</span></div>
        <div className="auth-tagline">India's car community 🏎️</div>

        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setMode('login'); setError(''); setSuccess('') }}
          >
            Log In
          </button>
          <button
            className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-form">
          {mode === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">Your Name</label>
              <input
                className="auth-input"
                placeholder="e.g. Arjun Kumar"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
            />
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}
          {success && <div className="auth-success">✓ {success}</div>}

          <button
            className="auth-submit"
            onClick={mode === 'login' ? handleLogin : handleSignup}
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In to RevUp' : 'Create Account'}
          </button>

          {mode === 'login' && (
            <button className="auth-forgot" onClick={handleReset} disabled={loading}>
              Forgot password?
            </button>
          )}
        </div>

        <div className="auth-footer">
          {mode === 'login'
            ? <>New to RevUp? <span className="auth-switch" onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>Sign up free</span></>
            : <>Already have an account? <span className="auth-switch" onClick={() => { setMode('login'); setError(''); setSuccess('') }}>Log in</span></>
          }
        </div>
      </div>
    </div>
  )
}
