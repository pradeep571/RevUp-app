import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchLikes, addLike, removeLike, fetchCommentCount, fetchComments, addComment, deleteComment, deletePost, fetchProfile } from '../data/api'

export default function PostCard({ post, onDelete }) {
  const { session } = useAuth()

  // ── Like state ──
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  // ── Comment state ──
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentCount, setCommentCount] = useState(0)

  // ── UI state ──
  const [saved, setSaved] = useState(false)
  const [following, setFollowing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authorName, setAuthorName] = useState('')

  const isOwner = session.user.id === post.user_id

  // ── Fetch author name ──
  useEffect(() => {
    fetchProfile(post.user_id).then(data => {
      setAuthorName(data ? (data.full_name || data.username) : 'User_' + post.user_id.slice(0, 5))
    })
  }, [post.user_id])

  // ── Fetch like count + whether this user liked ──
  useEffect(() => {
    fetchLikes(post.id).then(data => {
      setLikeCount(data.length)
      setLiked(data.some(l => l.user_id === session.user.id))
    })
  }, [post.id, session.user.id])

  // ── Fetch comment count ──
  useEffect(() => {
    fetchCommentCount(post.id).then(setCommentCount)
  }, [post.id])

  // ── Fetch full comments when section is opened ──
  useEffect(() => {
    if (showComments) loadComments()
  }, [showComments])

  async function loadComments() {
    const data = await fetchComments(post.id)
    setComments(data)
    setCommentCount(data.length)
  }

  // ── Toggle like ──
  async function handleLike() {
    if (liked) {
      setLiked(false)
      setLikeCount(c => c - 1)
      await removeLike(post.id, session.user.id)
    } else {
      setLiked(true)
      setLikeCount(c => c + 1)
      await addLike(post.id, session.user.id)
    }
  }

  // ── Post comment ──
  async function handleComment() {
    if (!commentText.trim()) return
    setCommentLoading(true)
    try {
      await addComment(post.id, session.user.id, commentText.trim())
      setCommentText('')
      loadComments()
    } catch (_) { /* ignore */ }
    setCommentLoading(false)
  }

  // ── Delete comment ──
  async function handleDeleteComment(commentId) {
    await deleteComment(commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
    setCommentCount(n => n - 1)
  }

  // ── Delete post ──
  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return
    await deletePost(post.id)
    onDelete(post.id)
  }

  // ── Time helper ──
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

      {/* ── Header ── */}
      <div className="post-header">
        <div className="post-avatar" style={{ background: 'linear-gradient(135deg,#f0c040,#e8a020)', color: '#000' }}>
          {session.user.email[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className="post-name">{authorName}</div>
          <div className="post-handle">
            {post.car_tag ? `🚗 ${post.car_tag}` : ''} · {timeAgo(post.created_at)}
          </div>
        </div>

        {!isOwner && (
          <button
            className={following ? 'follow-pill following' : 'follow-pill'}
            onClick={() => setFollowing(!following)}
          >
            {following ? 'Following ✓' : '+ Follow'}
          </button>
        )}

        {isOwner && (
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px', padding: '4px 8px', borderRadius: '8px', lineHeight: 1 }}
            >
              ···
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '100%', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', minWidth: '140px', zIndex: 50, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <button
                  onClick={handleDelete}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#ff4d2e', cursor: 'pointer', fontSize: '13px', textAlign: 'left', fontFamily: 'Inter,sans-serif' }}
                >
                  🗑️ Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Image ── */}
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

      {/* ── Spec Strip ── */}
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

      {/* ── Action Bar ── */}
      <div className="post-actions">
        <button className={liked ? 'act-btn liked' : 'act-btn'} onClick={handleLike}>
          {liked ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4d2e" stroke="#ff4d2e" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
          {likeCount.toLocaleString()}
        </button>

        <button className="act-btn" onClick={() => setShowComments(!showComments)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {commentCount > 0 ? commentCount : 'Comment'}
        </button>

        <button className="act-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Share
        </button>

        <button className={saved ? 'act-btn save-btn saved' : 'act-btn save-btn'} onClick={() => setSaved(!saved)}>
          {saved ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          )}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* ── Caption ── */}
      <div className="post-body">
        <div className="post-likes">{likeCount.toLocaleString()} revheads liked this</div>
        <p className="post-caption">
          <strong>{authorName}</strong>{' '}
          {post.caption && post.caption.split(' ').map((word, i) =>
            word.startsWith('#')
              ? <span key={i} className="hashtag">{word} </span>
              : word + ' '
          )}
        </p>
      </div>

      {/* ── Comments Section ── */}
      {showComments && (
        <div className="comments-section">
          {comments.length === 0 ? (
            <div className="comments-empty">No comments yet. Be first! 🚗</div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar">
                  {(c.profiles?.full_name || c.profiles?.username || 'U')[0].toUpperCase()}
                </div>
                <div className="comment-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="comment-author">
                      {c.profiles?.full_name || c.profiles?.username || 'User'}
                    </span>
                    <span className="comment-meta">{timeAgo(c.created_at)}</span>
                  </div>
                  <div className="comment-text">{c.content}</div>
                </div>
                {c.user_id === session.user.id && (
                  <button className="comment-delete" onClick={() => handleDeleteComment(c.id)} title="Delete comment">
                    ✕
                  </button>
                )}
              </div>
            ))
          )}

          {/* Input row */}
          <div className="comment-input-row">
            <div className="comment-input-avatar">
              {session.user.email[0].toUpperCase()}
            </div>
            <input
              className="comment-input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
              maxLength={500}
            />
            <button
              className="comment-submit"
              onClick={handleComment}
              disabled={commentLoading || !commentText.trim()}
            >
              {commentLoading ? '...' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
