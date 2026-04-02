import { useState } from 'react'
import { supabase } from '../supabase'

export default function AuthPage() {
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

  function switchMode(m) { setMode(m); setError(''); setSuccess('') }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        {['🏎️', '🚗', '⚡', '🏁', '🔥', '🚙'].map((e, i) => <div key={i} className="auth-bg-emoji">{e}</div>)}
      </div>
      <div className="auth-box">
        <div className="auth-logo">REV<span>UP</span></div>
        <div className="auth-tagline">India's car community 🏎️</div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => switchMode('login')}>Log In</button>
          <button className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'} onClick={() => switchMode('signup')}>Sign Up</button>
        </div>

        <div className="auth-form">
          {mode === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">Your Name</label>
              <input className="auth-input" placeholder="e.g. Arjun Kumar" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          )}
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input" type="password"
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
            />
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}
          {success && <div className="auth-success">✓ {success}</div>}

          <button className="auth-submit" onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In to RevUp' : 'Create Account'}
          </button>

          {mode === 'login' && (
            <button className="auth-forgot" onClick={handleReset} disabled={loading}>Forgot password?</button>
          )}
        </div>

        <div className="auth-footer">
          {mode === 'login'
            ? <>New to RevUp? <span className="auth-switch" onClick={() => switchMode('signup')}>Sign up free</span></>
            : <>Already have an account? <span className="auth-switch" onClick={() => switchMode('login')}>Log in</span></>
          }
        </div>
      </div>
    </div>
  )
}
