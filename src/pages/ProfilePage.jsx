import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchProfile, fetchCars, fetchPostsByUser, updateProfile } from '../data/api'
import { uploadImage } from '../lib/uploadImage'
import CarCard from '../components/CarCard'
import PostCard from '../components/PostCard'
import CarDetail from '../components/CarDetail'

export default function ProfilePage() {
  const { session } = useAuth()
  const { userId: urlUserId } = useParams()
  const userId = urlUserId || session?.user?.id
  const isOwner = session?.user?.id === userId
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [cars, setCars] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('garage')
  const [selectedCar, setSelectedCar] = useState(null)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)

  const defaultBanner = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000'

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

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !isOwner) return
    
    setUploading(true)
    try {
      const url = await uploadImage(file, 'banners', userId)
      await updateProfile(userId, { cover_url: url })
      setProfile(prev => ({ ...prev, cover_url: url }))
    } catch (err) {
      alert("Failed to upload banner: " + err.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="feed-col" style={{ alignItems: 'center', paddingTop: '40px' }}>Loading Profile... 🏁</div>
  }

  // Calculate stats
  const carCount = cars.length
  const postCount = posts.length
  const hpSum = cars.reduce((acc, c) => acc + (parseInt(c.hp) || 0), 0)
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes_count || 0), 0)

  const avatarText = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="feed-col" style={{ maxWidth: '640px', margin: '0 auto' }}>
      
      {/* Premium Dynamic Hero Section */}
      <div 
        className="profile-cover" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${profile?.cover_url || defaultBanner})` 
        }}
      >
        {isOwner && (
          <button 
            className="profile-share-btn" 
            style={{ position: 'absolute', top: '12px', right: '12px', margin: 0, padding: '6px 10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '⌛ Uploading...' : '📷 Edit Banner'}
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleBannerUpload} 
        />
        
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-big">
            {avatarText}
          </div>
        </div>
      </div>

      <div className="profile-header-info">
        <h1 className="profile-name-bebas">{profile?.full_name}</h1>
        <div className="profile-username-tag">
          @{profile?.username} · 📍 {profile?.location || 'The Track'}
        </div>

        <button className="profile-share-btn" onClick={handleShare}>
          {copied ? '✅ Link Copied!' : '🔗 Share Profile'}
        </button>

        {/* Glass Stat Grid */}
        <div className="profile-stat-grid">
          <div className="glass-stat-card">
            <span className="stat-val-premium">{carCount}</span>
            <span className="stat-lbl-premium">Cars</span>
          </div>
          <div className="glass-stat-card">
            <span className="stat-val-premium hp-highlight">{hpSum >= 1000 ? (hpSum/1000).toFixed(1) + 'K' : hpSum}</span>
            <span className="stat-lbl-premium">Total HP</span>
          </div>
          <div className="glass-stat-card">
            <span className="stat-val-premium" style={{ color: '#ff4d2e' }}>{totalLikes >= 1000 ? (totalLikes/1000).toFixed(1) + 'K' : totalLikes}</span>
            <span className="stat-lbl-premium">Total Likes</span>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="profile-tab-bar">
        <button 
          className={`profile-tab ${activeTab === 'garage' ? 'active' : ''}`}
          onClick={() => setActiveTab('garage')}
        >
          Garage 🚘
        </button>
        <button 
          className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Feed 📸
        </button>
      </div>

      {/* Content Area */}
      <div className="profile-content-area">
        {activeTab === 'garage' && (
          <div className="cars-grid" style={{ padding: 0 }}>
            {cars.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', gridColumn: '1/-1' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                No cars in the garage yet.
              </div>
            ) : (
              cars.map(c => <CarCard key={c.id} car={c} onSelect={setSelectedCar} />)
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                No activity on the feed.
              </div>
            ) : (
              posts.map(p => <PostCard key={p.id} post={{...p, profile}} />)
            )}
          </div>
        )}
      </div>

      {selectedCar && (
        <CarDetail car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  )
}
