import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchCars, fetchProfile } from '../data/api'
import CarCard from '../components/CarCard'
import CarDetail from '../components/CarDetail'
import AddCarForm from '../components/AddCarForm'

export default function GaragePage() {
  const { session } = useAuth()
  const [cars, setCars] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('garage')

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) return
      try {
        const [carsData, profileData] = await Promise.all([
          fetchCars(session.user.id),
          fetchProfile(session.user.id)
        ])
        const emojis = { ferrari: '🏎️', lamborghini: '🏎️', porsche: '🏎️', bmw: '🚗', mercedes: '🚗', audi: '🚗', tesla: '⚡', nissan: '🚗', toyota: '🚙', default: '🚗' }
        const bgs = ['linear-gradient(160deg,#1a0d0a,#2e1500,#120a08)', 'linear-gradient(160deg,#0d1117,#141a24,#0d1117)', 'linear-gradient(160deg,#040d12,#0d2030,#040d12)', 'linear-gradient(160deg,#0d1700,#142400,#0d1700)']
        
        const mappedCars = (carsData || []).map(c => ({
          ...c,
          emoji: c.emoji || emojis[c.make?.toLowerCase()] || emojis.default,
          imgBg: c.imgBg || bgs[Math.floor(Math.random() * bgs.length)],
          mods: c.mods || [],
          tag: c.tag || 'tag-gold',
          tagLabel: c.tagLabel || 'My Car',
          posts: c.posts || 0,
          status: c.status || 'Active'
        }))

        setCars(mappedCars)
        setProfile(profileData)
      } catch (err) {
        console.error("Error loading garage data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [session?.user?.id])

  const totalHP = cars.reduce((s, c) => s + (parseInt(c.hp) || 0), 0)
  const totalPosts = cars.reduce((s, c) => s + (c.posts || 0), 0)

  const displayName = profile?.full_name || profile?.username || 'User'
  const displayHandle = profile?.username ? `@${profile.username}` : ''

  if (loading) {
    return (
      <div className="app-layout">
        <div className="feed-col" style={{ maxWidth: '640px', textAlign: 'center', padding: '40px' }}>Loading Garage... 🚗</div>
      </div>
    )
  }

  function handleCarAdded(newCar) {
    setCars(prev => [newCar, ...prev])
  }

  function handleCarDeleted(carId) {
    setCars(prev => prev.filter(c => c.id !== carId))
    setSelected(null)
  }

  return (
    <div className="app-layout">
      <div className="feed-col" style={{ maxWidth: '640px' }}>
        <div className="feed-bar">
          <div><span className="feed-heading">My Garage</span><span className="feed-sub">{cars.length} cars</span></div>
          <button className="create-event-btn" onClick={() => setShowForm(true)}>+ Add Car</button>
        </div>
        
        <div className="garage-profile">
          <div className="garage-avatar">{displayName[0]?.toUpperCase() || 'U'}</div>
          <div className="garage-info">
            <div className="garage-name">{displayName}</div>
            <div className="garage-handle">{displayHandle} {profile?.location ? `· ${profile.location} 📍` : ''}</div>
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
        
        {selected && (
          <CarDetail 
            car={selected} 
            onClose={() => setSelected(null)} 
            onDelete={handleCarDeleted}
          />
        )}
        
        {showForm && (
          <AddCarForm 
            onAdd={handleCarAdded} 
            onClose={() => setShowForm(false)} 
          />
        )}
      </div>
    </div>
  )
}
