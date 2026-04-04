import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchPosts } from '../data/api'
import { STORIES, CHIPS, SUGGESTED } from '../data/constants'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'

export default function FeedPage() {
  const { session } = useAuth()
  const [chip, setChip] = useState('For You')
  const [showCreate, setShowCreate] = useState(false)
  const [realPosts, setRealPosts] = useState([])

  async function loadPosts() {
    try {
      const data = await fetchPosts()
      setRealPosts(data)
    } catch (_) { /* ignore */ }
  }

  useEffect(() => { loadPosts() }, [])

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

        {realPosts.map(post => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
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

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onPosted={() => loadPosts()}
        />
      )}
    </div>
  )
}
