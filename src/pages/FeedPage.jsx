import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchPosts, fetchAllProfiles, fetchFollowing } from '../data/api'
import { CHIPS } from '../data/constants'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'

export default function FeedPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  
  const [showCreate, setShowCreate] = useState(false)
  const [realPosts, setRealPosts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtering states
  const [activeChip, setActiveChip] = useState('For You')
  const [discoveryUsers, setDiscoveryUsers] = useState([])
  const [filterUserId, setFilterUserId] = useState(null)

  async function loadData() {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const [postsData, allProfiles, followingIds] = await Promise.all([
        fetchPosts(),
        fetchAllProfiles(),
        fetchFollowing(session.user.id)
      ])
      
      setRealPosts(postsData || [])
      
      // Process Discovery Bar
      const otherProfiles = allProfiles.filter(p => p.id !== session.user.id)
      
      const processed = otherProfiles.map(p => {
        const isFollowing = followingIds.includes(p.id)
        const hasPosts = postsData.some(post => post.user_id === p.id)
        return { ...p, isFollowing, hasPosts }
      })

      // Sort: Following with Posts first, then Suggested
      const sorted = processed.sort((a, b) => {
        if (a.hasPosts && a.isFollowing && (!b.hasPosts || !b.isFollowing)) return -1
        if (b.hasPosts && b.isFollowing && (!a.hasPosts || !a.isFollowing)) return 1
        return 0
      })

      setDiscoveryUsers(sorted)
    } catch (err) {
      console.error("Failed to load feed", err)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [session?.user?.id])

  function handleDelete(id) {
    setRealPosts(prev => prev.filter(p => p.id !== id))
  }

  const filteredPosts = filterUserId 
    ? realPosts.filter(p => p.user_id === filterUserId)
    : realPosts

  const activeFilterUser = discoveryUsers.find(u => u.id === filterUserId)

  return (
    <div className="app-layout">
      <div className="feed-col">
        <div className="feed-bar">
          <div>
            <span className="feed-heading">RevUp</span>
            <span className="feed-sub">{filterUserId ? `Posts by ${activeFilterUser?.full_name || 'Racer'}` : 'Bangalore'}</span>
          </div>
          {filterUserId && (
            <button 
              className="chip active" 
              style={{ marginLeft: 'auto', fontSize: '11px', padding: '4px 10px' }}
              onClick={() => setFilterUserId(null)}
            >
              ✕ Clear Filter
            </button>
          )}
        </div>

        {/* Discovery Bar */}
        <div className="stories">
          {/* Add Post Button */}
          <div className="story" onClick={() => setShowCreate(true)} style={{ cursor: 'pointer' }}>
            <div className="story-ring story-add-ring">
              <div className="story-inner">➕</div>
            </div>
            <span className="story-name">Add</span>
          </div>

          {/* Discovery Users */}
          {discoveryUsers.map(u => (
            <div 
              key={u.id} 
              className="story" 
              onClick={() => {
                if (u.hasPosts && u.isFollowing) {
                  setFilterUserId(u.id === filterUserId ? null : u.id)
                } else {
                  navigate(`/profile/${u.id}`)
                }
              }}
            >
              <div className={`story-ring ${!u.isFollowing ? 'seen' : ''}`} style={{ 
                background: u.hasPosts && u.isFollowing 
                  ? 'linear-gradient(135deg, var(--gold), var(--red))' 
                  : 'rgba(255,255,255,0.1)' 
              }}>
                <div className="story-inner" style={{ 
                  background: 'linear-gradient(135deg, #2a2a2e, #1a1a1e)',
                  color: u.hasPosts && u.isFollowing ? 'var(--gold)' : 'var(--muted)'
                }}>
                  {(u.full_name || u.username || '?')[0].toUpperCase()}
                </div>
              </div>
              <span className="story-name" style={{ color: u.id === filterUserId ? 'var(--gold)' : 'var(--muted)' }}>
                {u.username}
              </span>
            </div>
          ))}
        </div>

        {/* Category Chips - Restored */}
        <div className="chips">
          {CHIPS.map(c => (
            <button 
              key={c} 
              className={activeChip === c ? 'chip active' : 'chip'} 
              onClick={() => setActiveChip(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="feed-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Revving up... 🏎️</div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏁</div>
              <p>No posts found here. Follow more racers to fill your feed!</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onPosted={() => loadData()}
        />
      )}
    </div>
  )
}
