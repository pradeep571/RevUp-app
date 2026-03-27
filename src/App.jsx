import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'
import ImageUpload from './components/ImageUpload'
import { uploadImage } from './lib/uploadImage'

// ─────────────────────────────────────────
// DATA
// ─────────────────────────────────────────
const STORIES = [
  { id: 1, name: 'SpeedKing', emoji: '🏎️' },
  { id: 2, name: 'NitroSam', emoji: '🔥' },
  { id: 3, name: 'EVLover', emoji: '⚡' },
  { id: 4, name: 'DriftKing', emoji: '🚗' },
  { id: 5, name: 'TrackRat', emoji: '🏁' },
  { id: 6, name: 'ClassicJoe', emoji: '🚙' },
]
const CHIPS = ['For You', 'Following', 'JDM', 'Supercars', 'Modified', 'Track Days', 'Electric', 'Bangalore']
const POSTS = [
  {
    id: 1, user: 'SpeedKing', handle: '@speedking', time: '2h ago',
    avatarBg: 'linear-gradient(135deg,#f0c040,#e8a020)', avatarColor: '#000',
    emoji: '🏎️', imgBg: 'linear-gradient(160deg,#1a0d0a,#2e1500,#120a08)',
    badgeTop: { text: '🔥 Trending', cls: 'badge-red' },
    badgeCar: 'Ferrari 488 GTB', badgeExtra: 'BIC Track · Lap 7',
    specs: [{ val: '660', lbl: 'HP' }, { val: '3.0s', lbl: '0–100' }, { val: '330', lbl: 'Top km/h' }, { val: '1:42', lbl: 'Best Lap' }],
    likes: 2481, caption: 'She hit 330 on the back straight and I forgot my name 😤',
    hashtags: '#Ferrari #TrackDay #BIC #Supercar',
  },
  {
    id: 2, user: 'DriftKing', handle: '@driftking', time: '5h ago',
    avatarBg: 'linear-gradient(135deg,#3b82f6,#2563eb)', avatarColor: '#fff',
    emoji: '🚗', imgBg: 'linear-gradient(160deg,#0d1117,#141a24,#0d1117)',
    badgeTop: null, badgeCar: 'Nissan Skyline R34', badgeExtra: 'JDM Legend',
    specs: [{ val: '280', lbl: 'HP' }, { val: '5.6s', lbl: '0–100' }, { val: '250', lbl: 'Top km/h' }, { val: 'RB26', lbl: 'Engine' }],
    likes: 1823, caption: 'Full RB26 rebuild done. JDM legend lives again 🙌',
    hashtags: '#GTR #R34 #JDM #NissanSkyline',
  },
  {
    id: 3, user: 'EVLover', handle: '@evlover_blr', time: '6h ago',
    avatarBg: 'linear-gradient(135deg,#22c55e,#16a34a)', avatarColor: '#fff',
    emoji: '⚡', imgBg: 'linear-gradient(160deg,#040d12,#0d2030,#040d12)',
    badgeTop: null, badgeCar: 'Tesla Model S Plaid', badgeExtra: '1,020 HP electric',
    specs: [{ val: '1020', lbl: 'HP' }, { val: '2.1s', lbl: '0–100' }, { val: '322', lbl: 'Top km/h' }, { val: '628', lbl: 'Range km' }],
    likes: 983, caption: '0-100 in 2.1 seconds. ICE is done 😤',
    hashtags: '#Tesla #EV #ElectricCar #FutureOfDriving',
  },
]
const TRENDING = [
  { tag: '#SupercarSunday', count: '18.4K posts', sub: 'Motorsport' },
  { tag: '#BangaloreCarMeet', count: '9.2K posts', sub: 'Bangalore' },
  { tag: '#R34GTR', count: '7.8K posts', sub: 'JDM' },
  { tag: '#EVRevolution', count: '5.1K posts', sub: 'Electric' },
  { tag: '#StanceCulture', count: '4.4K posts', sub: 'Modified' },
  { tag: '#TrackDayIndia', count: '3.1K posts', sub: 'Motorsport' },
]
const SUGGESTED = [
  { id: 1, name: 'NitroSam', sub: '12.4K followers', bg: 'linear-gradient(135deg,#ff4d2e,#c0392b)', color: '#fff' },
  { id: 2, name: 'DriftKing', sub: '8.9K followers', bg: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff' },
  { id: 3, name: 'GarageGuru', sub: '6.2K followers', bg: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' },
]
const EVENTS = [
  { id: 1, month: 'APR', day: '5', name: 'Supercar Sunday — BIC Track Day', location: 'Buddh International Circuit, Greater Noida', type: 'Track Day', tag: 'tag-gold', going: 247, hot: true, desc: 'India\'s biggest supercar track day. Open to all cars above 300HP. Timing runs, parade laps and pit access included.' },
  { id: 2, month: 'APR', day: '12', name: 'JDM Legends Meetup — Bangalore', location: 'UB City Parking, Vittal Mallya Rd, Bangalore', type: 'Meetup', tag: 'tag-blue', going: 89, hot: false, desc: 'Monthly JDM meet for Skylines, Supras, RX-7s and all Japanese legends. Free entry.' },
  { id: 3, month: 'APR', day: '19', name: 'Auto Expo 2026 — Delhi', location: 'Bharat Mandapam, New Delhi', type: 'Expo', tag: 'tag-red', going: 1200, hot: true, desc: 'India\'s largest auto show. New car launches, concept reveals, EV showcases and celebrity appearances.' },
  { id: 4, month: 'APR', day: '26', name: 'Bangalore Night Drive', location: 'Meets at Cubbon Park, Bangalore', type: 'Drive', tag: 'tag-purple', going: 134, hot: false, desc: 'Saturday night convoy drive through Bangalore\'s best roads. 80km round trip.' },
  { id: 5, month: 'MAY', day: '3', name: 'EV Drive Day — Mumbai', location: 'Bandra Kurla Complex, Mumbai', type: 'Electric', tag: 'tag-green', going: 312, hot: false, desc: 'Test drives, charging demos and talks from EV owners. Free registration.' },
  { id: 6, month: 'MAY', day: '10', name: 'Modified Car Show — Bangalore', location: 'NICE Road, Electronic City, Bangalore', type: 'Show', tag: 'tag-gold', going: 420, hot: true, desc: 'South India\'s biggest modified car show. Cash prizes for winners.' },
]
const EVENT_FILTERS = ['All', 'Bangalore', 'Track Day', 'Meetup', 'Expo', 'Electric', 'Show', 'Drive']
const INITIAL_CARS = [
  { id: 1, emoji: '🏎️', imgBg: 'linear-gradient(160deg,#1a0d0a,#2e1500,#120a08)', make: 'Ferrari', model: '488 GTB', year: '2019', hp: '660', kmph: '330', sprint: '3.0s', engine: '3.9L Twin-Turbo V8', mods: ['Akrapovic Exhaust', 'Carbon Splitter', 'Race Suspension'], tag: 'tag-red', tagLabel: 'Supercar', posts: 24, status: 'Active' },
  { id: 2, emoji: '🚗', imgBg: 'linear-gradient(160deg,#0d1117,#141a24,#0d1117)', make: 'BMW', model: 'M3 Competition', year: '2022', hp: '510', kmph: '290', sprint: '3.9s', engine: '3.0L Twin-Turbo I6', mods: ['M Performance Exhaust', 'Lowering Springs', 'Carbon Mirrors'], tag: 'tag-blue', tagLabel: 'Sports', posts: 18, status: 'Active' },
  { id: 3, emoji: '⚡', imgBg: 'linear-gradient(160deg,#040d12,#0d2030,#040d12)', make: 'Tesla', model: 'Model S Plaid', year: '2023', hp: '1020', kmph: '322', sprint: '2.1s', engine: 'Tri-Motor Electric', mods: ['Custom Wrap', 'Performance Wheels', 'Tinted Windows'], tag: 'tag-green', tagLabel: 'Electric', posts: 12, status: 'Active' },
]
const INITIAL_LISTINGS = [
  { id: 1, emoji: '🏎️', imgBg: 'linear-gradient(160deg,#1a0d0a,#2e1500)', name: 'Ferrari 458 Italia', spec: '2015 · 42,000 km · Rosso Corsa', price: '₹2.8 Cr', location: 'Mumbai', views: '1.2K', verified: true, hp: '570', kmph: '325', sprint: '3.4s', engine: '4.5L V8', features: ['Original Paint', 'Full Service History', 'Ceramic Coating', 'Pirelli P Zero'], seller: { name: 'RohanM', sub: 'Verified Seller · 4 listings', bg: 'linear-gradient(135deg,#f0c040,#e8a020)', color: '#000' }, desc: 'One owner, always garaged, full Ferrari service history from authorized dealer.', category: 'Supercar' },
  { id: 2, emoji: '🚗', imgBg: 'linear-gradient(160deg,#0d1117,#141a24)', name: 'BMW M4 Competition', spec: '2021 · 18,000 km · Alpine White', price: '₹85 L', location: 'Delhi', views: '876', verified: true, hp: '510', kmph: '290', sprint: '3.9s', engine: '3.0L S58', features: ['M Carbon Seats', 'Harman Kardon', 'Adaptive M Suspension', 'Track Package'], seller: { name: 'PriyaK', sub: 'Verified Seller · 2 listings', bg: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff' }, desc: 'Pristine M4, carbon fibre roof, full M options package.', category: 'Sports' },
  { id: 3, emoji: '⚡', imgBg: 'linear-gradient(160deg,#040d12,#0d2030)', name: 'Porsche Taycan Turbo', spec: '2022 · 12,000 km · Gentian Blue', price: '₹1.2 Cr', location: 'Bangalore', views: '654', verified: true, hp: '680', kmph: '260', sprint: '3.2s', engine: 'Dual Motor Electric', features: ['Performance Battery Plus', 'Sport Chrono', 'Air Suspension', 'Panoramic Roof'], seller: { name: 'SureshV', sub: 'Verified Seller · 1 listing', bg: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }, desc: 'Loaded Taycan Turbo, fully electric with 500km+ range.', category: 'Electric' },
  { id: 4, emoji: '🚙', imgBg: 'linear-gradient(160deg,#17100d,#241a14)', name: 'Nissan GT-R R35', spec: '2017 · 35,000 km · Pearl White', price: '₹1.05 Cr', location: 'Pune', views: '2.1K', verified: false, hp: '565', kmph: '315', sprint: '2.9s', engine: '3.8L Twin-Turbo V6', features: ['Launch Control', 'Bose Audio', 'Nismo Upgrades', 'Carbon Brakes'], seller: { name: 'AmitJ', sub: 'Private Seller · 1 listing', bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: '#fff' }, desc: 'Godzilla in stunning Pearl White. Stage 1 tune, dyno proven 620whp.', category: 'JDM' },
  { id: 5, emoji: '🏎️', imgBg: 'linear-gradient(160deg,#1a0510,#2e0a20)', name: 'Lamborghini Huracán EVO', spec: '2020 · 8,000 km · Viola Pasifae', price: '₹3.5 Cr', location: 'Bangalore', views: '3.4K', verified: true, hp: '640', kmph: '325', sprint: '2.9s', engine: '5.2L V10 NA', features: ['LDVI System', 'MagneRide', 'Lifting System', 'Sensonum Audio'], seller: { name: 'KaranB', sub: 'Verified Seller · 6 listings', bg: 'linear-gradient(135deg,#f0c040,#ff4d2e)', color: '#000' }, desc: 'One of only 3 in this rare purple in India.', category: 'Supercar' },
  { id: 6, emoji: '🚗', imgBg: 'linear-gradient(160deg,#0a1200,#142400)', name: 'Porsche 911 GT3 RS', spec: '2023 · 2,000 km · Guards Red', price: '₹2.9 Cr', location: 'Chennai', views: '1.8K', verified: true, hp: '525', kmph: '296', sprint: '3.2s', engine: '4.0L Flat-6 NA', features: ['Weissach Package', 'PDK', 'Carbon Roof', 'Sport Exhaust'], seller: { name: 'VijayS', sub: 'Verified Seller · 3 listings', bg: 'linear-gradient(135deg,#ff4d2e,#c0392b)', color: '#fff' }, desc: 'Virtually new GT3 RS, barely driven. Full Porsche warranty remaining.', category: 'Sports' },
]
const MARKET_FILTERS = ['All', 'Supercar', 'Sports', 'JDM', 'Electric', 'Under ₹1Cr', 'Bangalore']
const SORT_OPTIONS = ['Newest', 'Price: Low', 'Price: High', 'Most Viewed']

// ─────────────────────────────────────────
// AUTH PAGE
// ─────────────────────────────────────────
function AuthPage() {
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

// ─────────────────────────────────────────
// POSTCARD
// ─────────────────────────────────────────

function RealPostCard({ post, session, onDelete }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes || 0)
  const [saved, setSaved] = useState(false)
  const [following, setFollowing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authorName, setAuthorName] = useState('') // 👈 add this
  const isOwner = session.user.id === post.user_id

  // 👇 Add this useEffect to fetch the post author's profile
  useEffect(() => {
    async function fetchAuthor() {
      const { data } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', post.user_id)
        .maybeSingle() // 👈 won't crash if no profile found

      if (data) {
        setAuthorName(data.full_name || data.username)
      } else {
        // fallback: use the user_id prefix
        setAuthorName('User_' + post.user_id.slice(0, 5))
      }
    }
    fetchAuthor()
  }, [post.user_id])

  function handleLike() { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1) }

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', post.id)
    onDelete(post.id)
  }

  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const hasSpecs = post.hp || post.top_speed || post.sprint || post.best_lap

  return (
    <article className="post">
      {/* Header */}
      <div className="post-header">
        <div className="post-avatar" style={{ background: 'linear-gradient(135deg,#f0c040,#e8a020)', color: '#000' }}>
          {session.user.email[0].toUpperCase()}
        </div>
        <div>
          <div className="post-name">{authorName}</div>
          <div className="post-handle">
            {post.car_tag ? `🚗 ${post.car_tag}` : ''} · {timeAgo(post.created_at)}
          </div>
        </div>
        {!isOwner && (
          <button className={following ? 'follow-pill following' : 'follow-pill'} onClick={() => setFollowing(!following)}>
            {following ? 'Following ✓' : '+ Follow'}
          </button>
        )}
        {isOwner && (
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px', padding: '4px 8px', borderRadius: '8px', lineHeight: 1 }}>
              ···
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '100%', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', minWidth: '140px', zIndex: 50, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <button onClick={handleDelete}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#ff4d2e', cursor: 'pointer', fontSize: '13px', textAlign: 'left', fontFamily: 'Inter,sans-serif' }}>
                  🗑️ Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="post-img" style={{ padding: 0, overflow: 'hidden' }}>
        <img src={post.image_url} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div className="post-img-overlay">
          <div></div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {post.car_tag && <span className="badge badge-gold">{post.car_tag}</span>}
            {post.location && <span className="badge badge-dark">📍 {post.location}</span>}
          </div>
        </div>
      </div>

      {/* Spec Strip */}
      {hasSpecs && (
        <div className="spec-strip">
          {[
            { val: post.hp, lbl: 'HP' },
            { val: post.sprint, lbl: '0–100' },
            { val: post.top_speed, lbl: 'Top km/h' },
            { val: post.best_lap, lbl: 'Best Lap' },
          ].filter(s => s.val).map((s, i) => (
            <div key={i} className="spec-item">
              <div className="spec-val">{s.val}</div>
              <div className="spec-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button className={liked ? 'act-btn liked' : 'act-btn'} onClick={handleLike}>
          {liked ? '❤️' : '🤍'} {likes.toLocaleString()}
        </button>
        <button className="act-btn">💬 Comment</button>
        <button className="act-btn">↗ Share</button>
        <button className={saved ? 'act-btn save-btn saved' : 'act-btn save-btn'} onClick={() => setSaved(!saved)}>
          {saved ? '🔖 Saved' : '🔖 Save'}
        </button>
      </div>

      {/* Body */}
      <div className="post-body">
        <div className="post-likes">{likes.toLocaleString()} revheads liked this</div>
        <p className="post-caption">
          <strong>{authorName}</strong>{' '}
          {post.caption && post.caption.split(' ').map((word, i) =>
            word.startsWith('#')
              ? <span key={i} className="hashtag">{word} </span>
              : word + ' '
          )}
        </p>
      </div>
    </article>
  )
}

// ─────────────────────────────────────────
// EVENTCARD
// ─────────────────────────────────────────
function EventCard({ event }) {
  const [going, setGoing] = useState(false)
  const [count, setCount] = useState(event.going)
  const [expanded, setExpanded] = useState(false)
  function handleGoing() { setGoing(!going); setCount(going ? count - 1 : count + 1) }
  return (
    <div className={`event-card ${going ? 'event-card-going' : ''}`}>
      <div className={`event-date ${going ? 'event-date-active' : ''}`}>
        <div className="event-month">{event.month}</div>
        <div className="event-day">{event.day}</div>
      </div>
      <div className="event-body">
        <div className="event-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="event-name">{event.name}</div>
            <div className="event-location">📍 {event.location}</div>
          </div>
          <div className="event-going-box">
            <div className="event-going-count">{count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count}</div>
            <div className="event-going-label">going</div>
          </div>
        </div>
        <div className="event-tags-row">
          <span className={`event-tag ${event.tag}`}>{event.type}</span>
          {event.hot && <span className="event-tag tag-hot">🔥 Hot</span>}
        </div>
        {expanded && <p className="event-desc">{event.desc}</p>}
        <div className="event-actions">
          <button className="event-more" onClick={() => setExpanded(!expanded)}>{expanded ? 'Less ▲' : 'More info ▼'}</button>
          <button className={going ? 'event-join-btn going' : 'event-join-btn'} onClick={handleGoing}>{going ? '✓ Going' : 'Join'}</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// GARAGE COMPONENTS
// ─────────────────────────────────────────
function CarCard({ car, onSelect }) {
  return (
    <div className="car-card" onClick={() => onSelect(car)}>
      <div className="car-card-img" style={{ background: car.imgBg }}>
        <span style={{ fontSize: '52px' }}>{car.emoji}</span>
        <div className="car-card-img-overlay"><span className={`event-tag ${car.tag}`}>{car.tagLabel}</span></div>
      </div>
      <div className="car-card-body">
        <div className="car-card-name">{car.year} {car.make} {car.model}</div>
        <div className="car-card-engine">{car.engine}</div>
        <div className="car-card-specs">
          {[{ v: car.hp, l: 'HP' }, { v: car.sprint, l: '0–100' }, { v: car.kmph, l: 'Top km/h' }].map((s, i) => (
            <div key={i} className="car-mini-spec">
              <div className="car-mini-val">{s.v}</div>
              <div className="car-mini-lbl">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="car-card-footer">
          <span className="car-posts">{car.posts} posts</span>
          <span className="car-status">{car.status}</span>
        </div>
      </div>
    </div>
  )
}
function CarDetail({ car, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-img" style={{ background: car.imgBg }}>
          <span style={{ fontSize: '80px' }}>{car.emoji}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="modal-img-overlay"><span className={`event-tag ${car.tag}`}>{car.tagLabel}</span></div>
        </div>
        <div className="modal-body">
          <div className="modal-title">{car.year} {car.make} {car.model}</div>
          <div className="modal-engine">{car.engine}</div>
          <div className="modal-spec-strip">
            {[{ v: car.hp, l: 'HP' }, { v: car.sprint, l: '0–100 km/h' }, { v: car.kmph, l: 'Top Speed' }].map((s, i) => (
              <div key={i} className="modal-spec"><div className="modal-spec-val">{s.v}</div><div className="modal-spec-lbl">{s.l}</div></div>
            ))}
          </div>
          <div className="modal-section-title">Modifications</div>
          <div className="modal-mods">
            {car.mods.length === 0
              ? <div className="modal-mod" style={{ color: 'var(--muted)' }}>No mods added yet</div>
              : car.mods.map((mod, i) => <div key={i} className="modal-mod">🔧 {mod}</div>)
            }
          </div>
          <div className="modal-actions">
            <button className="modal-post-btn">📸 Post this car</button>
            <button className="modal-edit-btn">✏️ Edit</button>
          </div>
        </div>
      </div>
    </div>
  )
}
function AddCarForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ make: '', model: '', year: '', hp: '', kmph: '', sprint: '', engine: '' })
  const emojis = { ferrari: '🏎️', lamborghini: '🏎️', porsche: '🏎️', bmw: '🚗', mercedes: '🚗', audi: '🚗', tesla: '⚡', nissan: '🚗', toyota: '🚙', default: '🚗' }
  const bgs = ['linear-gradient(160deg,#1a0d0a,#2e1500,#120a08)', 'linear-gradient(160deg,#0d1117,#141a24,#0d1117)', 'linear-gradient(160deg,#040d12,#0d2030,#040d12)', 'linear-gradient(160deg,#0d1700,#142400,#0d1700)']
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }
  function handleSubmit() {
    if (!form.make || !form.model || !form.year) return
    onAdd({ id: Date.now(), emoji: emojis[form.make.toLowerCase()] || emojis.default, imgBg: bgs[Math.floor(Math.random() * bgs.length)], make: form.make, model: form.model, year: form.year, hp: form.hp || '—', kmph: form.kmph || '—', sprint: form.sprint || '—', engine: form.engine || 'Unknown engine', mods: [], tag: 'tag-gold', tagLabel: 'My Car', posts: 0, status: 'Active' })
    onClose()
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <div className="form-title">Add to Garage</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="form-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Make *</label><input className="form-input" name="make" placeholder="e.g. Ferrari" value={form.make} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Model *</label><input className="form-input" name="model" placeholder="e.g. 488 GTB" value={form.model} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Year *</label><input className="form-input" name="year" placeholder="e.g. 2022" value={form.year} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Engine</label><input className="form-input" name="engine" placeholder="e.g. 3.9L V8" value={form.engine} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Horsepower</label><input className="form-input" name="hp" placeholder="e.g. 660" value={form.hp} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Top Speed (km/h)</label><input className="form-input" name="kmph" placeholder="e.g. 330" value={form.kmph} onChange={handleChange} /></div>
          </div>
          <div className="form-group"><label className="form-label">0–100 km/h</label><input className="form-input" name="sprint" placeholder="e.g. 3.0s" value={form.sprint} onChange={handleChange} /></div>
          <button className="form-submit" onClick={handleSubmit} style={{ opacity: (!form.make || !form.model || !form.year) ? 0.4 : 1 }}>Add to Garage 🚗</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// MARKETPLACE COMPONENTS
// ─────────────────────────────────────────
function ListingCard({ listing, onSelect }) {
  const [saved, setSaved] = useState(false)
  return (
    <div className="listing-card" onClick={() => onSelect(listing)}>
      <div className="listing-img" style={{ background: listing.imgBg }}>
        <span style={{ fontSize: '56px' }}>{listing.emoji}</span>
        <div className="listing-img-top">
          <span className="listing-price">{listing.price}</span>
          {listing.verified && <span className="listing-verified">✓ Verified</span>}
        </div>
        <button className={saved ? 'listing-save-btn saved' : 'listing-save-btn'} onClick={e => { e.stopPropagation(); setSaved(!saved) }}>🔖</button>
      </div>
      <div className="listing-body">
        <div className="listing-name">{listing.name}</div>
        <div className="listing-spec">{listing.spec}</div>
        <div className="listing-meta">
          <span className="listing-loc">📍 {listing.location}</span>
          <span className="listing-views">👁 {listing.views}</span>
        </div>
      </div>
    </div>
  )
}
function ListingDetail({ listing, onClose }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [contacted, setContacted] = useState(false)
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="lmodal-img" style={{ background: listing.imgBg }}>
          <span style={{ fontSize: '80px' }}>{listing.emoji}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="lmodal-price">{listing.price}</div>
        </div>
        <div className="lmodal-body">
          <div className="lmodal-title">{listing.name}</div>
          <div className="lmodal-subtitle">{listing.spec} · 📍 {listing.location}</div>
          <div className="lmodal-spec-strip">
            {[{ v: listing.hp + 'hp', l: 'Power' }, { v: listing.sprint, l: '0–100' }, { v: listing.kmph + 'km/h', l: 'Top Speed' }, { v: listing.engine, l: 'Engine' }].map((s, i) => (
              <div key={i} className="lmodal-spec">
                <div className="lmodal-spec-val" style={{ fontSize: i === 3 ? '10px' : '14px' }}>{s.v}</div>
                <div className="lmodal-spec-lbl">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="lmodal-section">Description</div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '14px' }}>{listing.desc}</p>
          <div className="lmodal-section">Features & Options</div>
          <div className="lmodal-features">
            {listing.features.map((f, i) => <span key={i} className="lmodal-feature">✓ {f}</span>)}
          </div>
          <div className="lmodal-section">Seller</div>
          <div className="lmodal-seller">
            <div className="lmodal-seller-av" style={{ background: listing.seller.bg, color: listing.seller.color }}>{listing.seller.name[0]}</div>
            <div>
              <div className="lmodal-seller-name">{listing.seller.name}</div>
              <div className="lmodal-seller-sub">{listing.seller.sub}</div>
            </div>
            {listing.verified && <div className="lmodal-seller-badge">⭐ Verified</div>}
          </div>
          <div className="lmodal-actions">
            <button className="lmodal-contact" onClick={() => setContacted(true)}>{contacted ? '✓ Request Sent!' : '📞 Contact Seller'}</button>
            <button className={wishlisted ? 'lmodal-wishlist wishlisted' : 'lmodal-wishlist'} onClick={() => setWishlisted(!wishlisted)}>{wishlisted ? '🔖 Saved' : '🔖 Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
function SellForm({ onClose, onList }) {
  const [form, setForm] = useState({ make: '', model: '', year: '', price: '', km: '', location: '', desc: '' })
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }
  function handleSubmit() {
    if (!form.make || !form.model || !form.price) return
    const emojis = { ferrari: '🏎️', lamborghini: '🏎️', porsche: '🏎️', bmw: '🚗', mercedes: '🚗', tesla: '⚡', nissan: '🚗', default: '🚗' }
    const bgs = ['linear-gradient(160deg,#1a0d0a,#2e1500)', 'linear-gradient(160deg,#0d1117,#141a24)', 'linear-gradient(160deg,#040d12,#0d2030)']
    onList({ id: Date.now(), emoji: emojis[form.make.toLowerCase()] || emojis.default, imgBg: bgs[Math.floor(Math.random() * bgs.length)], name: `${form.make} ${form.model}`, spec: `${form.year} · ${form.km || '—'} km · ${form.location || 'India'}`, price: `₹${form.price}`, location: form.location || 'India', views: '0', verified: false, hp: '—', kmph: '—', sprint: '—', engine: '—', features: [], desc: form.desc || 'No description provided.', seller: { name: 'You', sub: 'Private Seller · 1 listing', bg: 'linear-gradient(135deg,#f0c040,#e8a020)', color: '#000' }, category: 'Other' })
    onClose()
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <div className="form-title">List Your Car 🚗</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="sell-form-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Make *</label><input className="form-input" name="make" placeholder="e.g. BMW" value={form.make} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Model *</label><input className="form-input" name="model" placeholder="e.g. M4" value={form.model} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Year</label><input className="form-input" name="year" placeholder="e.g. 2021" value={form.year} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Kilometres</label><input className="form-input" name="km" placeholder="e.g. 18000" value={form.km} onChange={handleChange} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Asking Price *</label>
            <div className="price-input-wrap">
              <span className="price-prefix">₹</span>
              <input className="form-input price-input" name="price" placeholder="e.g. 85 L" value={form.price} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" name="location" placeholder="e.g. Bangalore" value={form.location} onChange={handleChange} /></div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" name="desc" placeholder="Describe your car..." value={form.desc} onChange={handleChange} style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>
          <button className="form-submit" onClick={handleSubmit} style={{ opacity: (!form.make || !form.model || !form.price) ? 0.4 : 1 }}>List for Sale 🚗</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// PAGES
// ─────────────────────────────────────────

function CreatePostModal({ session, onClose, onPosted }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [carTag, setCarTag] = useState('')
  const [location, setLocation] = useState('')
  const [hp, setHp] = useState('')
  const [topSpeed, setTopSpeed] = useState('')
  const [sprint, setSprint] = useState('')
  const [bestLap, setBestLap] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handlePost() {
    if (!imageUrl) { setError('Please upload a photo first.'); return }
    if (!caption.trim()) { setError('Add a caption!'); return }
    setSubmitting(true); setError('')
    try {
      const { error: dbErr } = await supabase.from('posts').insert({
        user_id: session.user.id,
        image_url: imageUrl,
        caption: caption.trim(),
        car_tag: carTag.trim() || null,
        location: location.trim() || null,
        hp: hp.trim() || null,
        top_speed: topSpeed.trim() || null,
        sprint: sprint.trim() || null,
        best_lap: bestLap.trim() || null,
        likes: 0,
      })
      if (dbErr) throw dbErr
      onPosted?.()
      onClose()
    } catch (err) {
      setError(err.message)
    }
    setSubmitting(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="cp-modal-box" onClick={e => e.stopPropagation()}>
        <div className="cp-header">
          <div className="cp-title">New Post 📸</div>
          <button className="cp-close" onClick={onClose}>✕</button>
        </div>
        <div className="cp-body">
          <ImageUpload
            userId={session.user.id}
            folder="posts"
            aspectRatio="4/3"
            label="Drop your car photo here"
            onUploaded={url => { setImageUrl(url); setError('') }}
            onError={msg => setError(msg)}
          />
          <textarea
            className="cp-caption"
            placeholder="Write a caption... #Ferrari #TrackDay"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          <div className="cp-row">
            <input className="cp-input" placeholder="🚗 Car (e.g. Ferrari 488)" value={carTag} onChange={e => setCarTag(e.target.value)} />
            <input className="cp-input" placeholder="📍 Location" value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          {/* Spec fields */}
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Car Specs (optional)</div>
          <div className="cp-row">
            <input className="cp-input" placeholder="🐎 HP (e.g. 660)" value={hp} onChange={e => setHp(e.target.value)} />
            <input className="cp-input" placeholder="⚡ 0–100 (e.g. 3.0s)" value={sprint} onChange={e => setSprint(e.target.value)} />
          </div>
          <div className="cp-row">
            <input className="cp-input" placeholder="🏎️ Top Speed (e.g. 330)" value={topSpeed} onChange={e => setTopSpeed(e.target.value)} />
            <input className="cp-input" placeholder="🏁 Best Lap (e.g. 1:42)" value={bestLap} onChange={e => setBestLap(e.target.value)} />
          </div>

          {error && <div className="cp-error">⚠️ {error}</div>}
          <button className="cp-submit" onClick={handlePost} disabled={submitting || !imageUrl}>
            {submitting ? 'Posting...' : 'Post to RevUp 🔥'}
          </button>
        </div>
      </div>
    </div>
  )
}


function FeedPage({ session }) {
  const [chip, setChip] = useState('For You')
  const [showCreate, setShowCreate] = useState(false)
  const [realPosts, setRealPosts] = useState([])

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setRealPosts(data)
  }

  useEffect(() => { fetchPosts() }, [])

  function handleDelete(id) {
    setRealPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="app-layout">
      <div className="feed-col">
        <div className="feed-bar">
          <div>
            <span className="feed-heading">RevUp</span>
            <span className="feed-sub">Bangalore</span>
          </div>
        </div>

        <div className="stories">
          <div className="story" onClick={() => setShowCreate(true)} style={{ cursor: 'pointer' }}>
            <div className="story-ring story-add-ring">
              <div className="story-inner">➕</div>
            </div>
            <span className="story-name">Add</span>
          </div>
          {STORIES.map(s => (
            <div key={s.id} className="story">
              <div className="story-ring"><div className="story-inner">{s.emoji}</div></div>
              <span className="story-name">{s.name}</span>
            </div>
          ))}
        </div>

        <div className="chips">
          {CHIPS.map(c => (
            <button key={c} className={chip === c ? 'chip active' : 'chip'} onClick={() => setChip(c)}>{c}</button>
          ))}
        </div>

        {/* Real posts */}
        {realPosts.map(post => (
          <RealPostCard key={post.id} post={post} session={session} onDelete={handleDelete} />
        ))}


      </div>

      <aside className="right-panel">
        <p className="panel-title">Suggested</p>
        {SUGGESTED.map(u => (
          <div key={u.id} className="sug-user">
            <div className="sug-av" style={{ background: u.bg, color: u.color }}>{u.name[0]}</div>
            <div><div className="sug-name">{u.name}</div><div className="sug-sub">{u.sub}</div></div>
            <button className="sug-follow">Follow</button>
          </div>
        ))}
      </aside>

      <button className="create-post-btn" onClick={() => setShowCreate(true)} title="Create Post">＋</button>

      {showCreate && (
        <CreatePostModal
          session={session}
          onClose={() => setShowCreate(false)}
          onPosted={() => fetchPosts()}
        />
      )}
    </div>
  )
}

function GaragePage() {
  const [cars, setCars] = useState(INITIAL_CARS)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('garage')
  const totalHP = cars.reduce((s, c) => s + (parseInt(c.hp) || 0), 0)
  const totalPosts = cars.reduce((s, c) => s + c.posts, 0)
  return (
    <div className="feed-col" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="feed-bar">
        <div><span className="feed-heading">My Garage</span><span className="feed-sub">{cars.length} cars</span></div>
        <button className="create-event-btn" onClick={() => setShowForm(true)}>+ Add Car</button>
      </div>
      <div className="garage-profile">
        <div className="garage-avatar">AK</div>
        <div className="garage-info">
          <div className="garage-name">Arjun Kumar</div>
          <div className="garage-handle">@arjun_drives · Bangalore 📍</div>
        </div>
        <div className="garage-stats">
          <div className="garage-stat"><div className="garage-stat-val">{cars.length}</div><div className="garage-stat-lbl">Cars</div></div>
          <div className="garage-stat"><div className="garage-stat-val">{totalHP.toLocaleString()}</div><div className="garage-stat-lbl">Total HP</div></div>
          <div className="garage-stat"><div className="garage-stat-val">{totalPosts}</div><div className="garage-stat-lbl">Posts</div></div>
        </div>
      </div>
      <div className="garage-tabs">
        {['garage', 'compare'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'garage-tab active' : 'garage-tab'} onClick={() => setActiveTab(tab)}>
            {tab === 'garage' ? '🚗 My Cars' : '⚡ Compare'}
          </button>
        ))}
      </div>
      {activeTab === 'garage' && (
        <div className="cars-grid">
          {cars.map(car => <CarCard key={car.id} car={car} onSelect={setSelected} />)}
          <div className="add-car-tile" onClick={() => setShowForm(true)}>
            <div className="add-car-plus">+</div>
            <div className="add-car-label">Add Car</div>
          </div>
        </div>
      )}
      {activeTab === 'compare' && (
        <div className="compare-table">
          <div className="compare-header">
            <div className="compare-cell compare-label"></div>
            {cars.map(car => (
              <div key={car.id} className="compare-cell compare-car-name">
                <div style={{ fontSize: '22px' }}>{car.emoji}</div>
                <div>{car.make}</div>
                <div style={{ color: 'var(--muted)', fontSize: '10px' }}>{car.model}</div>
              </div>
            ))}
          </div>
          {[{ lbl: 'Year', key: 'year' }, { lbl: 'HP', key: 'hp' }, { lbl: '0–100', key: 'sprint' }, { lbl: 'Top Speed', key: 'kmph' }, { lbl: 'Engine', key: 'engine' }].map(row => (
            <div key={row.lbl} className="compare-row">
              <div className="compare-cell compare-label">{row.lbl}</div>
              {cars.map(car => (
                <div key={car.id} className={`compare-cell ${row.key === 'hp' ? 'compare-highlight' : ''}`}>
                  {car[row.key]}{row.key === 'hp' ? ' hp' : ''}{row.key === 'kmph' ? ' km/h' : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {selected && <CarDetail car={selected} onClose={() => setSelected(null)} />}
      {showForm && <AddCarForm onAdd={car => setCars([...cars, car])} onClose={() => setShowForm(false)} />}
    </div>
  )
}

function MarketplacePage() {
  const [listings, setListings] = useState(INITIAL_LISTINGS)
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('Newest')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showSell, setShowSell] = useState(false)
  const filtered = listings.filter(l => {
    const matchFilter = filter === 'All' ? true : filter === 'Under ₹1Cr' ? !['₹1.2 Cr', '₹2.8 Cr', '₹3.5 Cr', '₹2.9 Cr'].includes(l.price) : filter === 'Bangalore' ? l.location === 'Bangalore' : l.category === filter
    const matchSearch = search === '' || l.name.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })
  return (
    <div className="feed-col" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="feed-bar">
        <div><span className="feed-heading">Marketplace</span><span className="feed-sub">{listings.length} listings</span></div>
        <button className="create-event-btn" onClick={() => setShowSell(true)}>+ Sell Car</button>
      </div>
      <div className="market-search">
        <span className="market-search-icon">🔍</span>
        <input placeholder="Search make, model, city..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <span style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: '14px' }} onClick={() => setSearch('')}>✕</span>}
      </div>
      <div className="chips" style={{ paddingTop: '4px' }}>
        {MARKET_FILTERS.map(f => <button key={f} className={filter === f ? 'chip active' : 'chip'} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="market-bar">
        {SORT_OPTIONS.map(s => <button key={s} className={sort === s ? 'market-sort active' : 'market-sort'} onClick={() => setSort(s)}>{s}</button>)}
        <span className="market-count">{filtered.length} results</span>
      </div>
      {filtered.length === 0
        ? <div className="events-empty">No listings found 🚗</div>
        : <div className="market-grid">{filtered.map(l => <ListingCard key={l.id} listing={l} onSelect={setSelected} />)}</div>
      }
      {selected && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}
      {showSell && <SellForm onClose={() => setShowSell(false)} onList={l => setListings([l, ...listings])} />}
    </div>
  )
}

function EventsPage() {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? EVENTS : EVENTS.filter(e => e.type === filter || e.location.toLowerCase().includes(filter.toLowerCase()))
  return (
    <div className="feed-col" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="feed-bar">
        <div><span className="feed-heading">Events</span><span className="feed-sub">Bangalore & beyond 📍</span></div>
        <button className="create-event-btn">+ Create</button>
      </div>
      <div className="chips">
        {EVENT_FILTERS.map(f => <button key={f} className={filter === f ? 'chip active' : 'chip'} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="events-list">
        {filtered.length === 0 ? <div className="events-empty">No events found 🚗</div> : filtered.map(event => <EventCard key={event.id} event={event} />)}
      </div>
    </div>
  )
}

function TrendingPage() {
  return (
    <div className="feed-col" style={{ maxWidth: '520px', margin: '0 auto' }}>
      <div className="feed-bar"><div><span className="feed-heading">Trending</span><span className="feed-sub">Right now 🔥</span></div></div>
      <div style={{ padding: '8px 16px' }}>
        {TRENDING.map((t, i) => (
          <div key={i} className="trend-item" style={{ padding: '14px 0' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>#{i + 1} · {t.sub}</div>
              <div className="trend-tag" style={{ fontSize: '15px' }}>{t.tag}</div>
              <div className="trend-count" style={{ marginTop: '3px' }}>{t.count}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// MAIN APP — with auth
// ─────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('feed')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const pages = ['feed', 'garage', 'market', 'events', 'trending']

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setPage('feed')
  }

  // Show loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#08080a' }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '36px', color: '#f0c040', letterSpacing: '3px' }}>
          REV<span style={{ color: '#ff4d2e' }}>UP</span>
        </div>
      </div>
    )
  }

  // Show login if not logged in
  if (!session) return <AuthPage />

  // Show full app if logged in
  return (
    <div>
      <nav className="navbar">
        <div className="logo">REV<span>UP</span></div>
        <div className="nav-links">
          {pages.map(p => (
            <button key={p} className={page === p ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar">{session.user.email[0].toUpperCase()}</div>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#72727a', fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all .2s' }}>
            Log out
          </button>
        </div>
      </nav>
      {page === 'feed' && <FeedPage session={session} />}
      {page === 'garage' && <GaragePage />}
      {page === 'market' && <MarketplacePage />}
      {page === 'events' && <EventsPage />}
      {page === 'trending' && <TrendingPage />}
    </div>
  )
}
