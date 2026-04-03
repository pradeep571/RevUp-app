import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchProfile, fetchCars, fetchPostsByUser } from '../data/api'
import CarCard from '../components/CarCard'
import PostCard from '../components/PostCard'
import CarDetail from '../components/CarDetail'

export default function ProfilePage() {
  const { session } = useAuth()
  const { userId: urlUserId } = useParams()
  // Default to the logged-in user if the URL parameter is missing
  const userId = urlUserId || session?.user?.id

  const [profile, setProfile] = useState(null)
  const [cars, setCars] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('garage')
  const [selectedCar, setSelectedCar] = useState(null)

  useEffect(() => {
    async function loadData() {
      if (!userId) return
      setLoading(true)
      try {
        const [profData, carsData, postsData] = await Promise.all([
          fetchProfile(userId),
          fetchCars(userId),
          fetchPostsByUser(userId)
        ])
        setProfile(profData || { username: 'Racer', full_name: 'Unknown User', location: 'Unknown' })
        setCars(carsData || [])
        setPosts(postsData || [])
      } catch (err) {
        console.error("Failed to load profile details", err)
      }
      setLoading(false)
    }
    loadData()
  }, [userId])

  if (loading) {
    return <div className="feed-col" style={{ alignItems: 'center', paddingTop: '40px' }}>Loading Profile... 🏁</div>
  }

  // Calculate stats
  const carCount = cars.length
  const postCount = posts.length
  const hpSum = cars.reduce((acc, c) => acc + (c.hp || 0), 0)

  // Generate Avatar string
  const avatarText = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'

  return (
    <div className="feed-col" style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Hero Section */}
      <div className="profile-hero" style={{ padding: '32px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="profile-avatar" style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #e63946)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' 
          }}>
            {avatarText}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{profile?.full_name}</h1>
            <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '12px' }}>@{profile?.username} · 📍 {profile?.location || 'The Track'}</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{carCount}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Cars</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{postCount}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Posts</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary)' }}>{hpSum}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Total HP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('garage')}
          style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: activeTab === 'garage' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'garage' ? '#fff' : 'var(--muted)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Garage 🚘
        </button>
        <button 
          onClick={() => setActiveTab('posts')}
          style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: activeTab === 'posts' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'posts' ? '#fff' : 'var(--muted)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Posts 📸
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'garage' && (
          <div className="garage-grid">
            {cars.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0', width: '100%' }}>No cars strictly built yet.</div>
            ) : (
              cars.map(c => <CarCard key={c.id} car={c} onClick={setSelectedCar} />)
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>No posts on the board.</div>
            ) : (
              posts.map(p => <PostCard key={p.id} post={{...p, profiles: profile}} />)
            )}
          </div>
        )}
      </div>

      {/* Reusable Car Detail Modal */}
      {selectedCar && (
        <CarDetail car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  )
}
