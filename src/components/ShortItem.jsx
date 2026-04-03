import { useRef, useEffect, useState } from 'react'
import { likeShort } from '../data/api'

export default function ShortItem({ short }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [likes, setLikes] = useState(short.likes || 0)
  const [hasLiked, setHasLiked] = useState(false)

  // Use Intersection Observer to auto-play/pause videos based on visibility in the snap container
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {})
          } else {
            videoRef.current?.pause()
            setIsPlaying(false)
          }
        })
      },
      { threshold: 0.6 } // Video plays when it's at least 60% visible
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current)
    }
  }, [])

  function togglePlay() {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  async function handleLike() {
    if (hasLiked) return
    setHasLiked(true)
    setLikes(prev => prev + 1)
    try {
      await likeShort(short.id, likes)
    } catch (_) { /* ignore */ }
  }

  return (
    <div className="short-container">
      <video
        ref={videoRef}
        src={short.video_url}
        className="short-video"
        loop
        playsInline
        muted // Muted to allow auto-play policies on most browsers effortlessly
        onClick={togglePlay}
      />
      
      {/* Video Overlay UI */}
      <div className="short-overlay">
        <div className="short-header">
          <div className="short-title">Shorts 📸</div>
        </div>

        <div className="short-bottom">
          <div className="short-info">
            <div className="short-username">@{short.profiles?.username || 'user'}</div>
            <p className="short-caption">{short.caption}</p>
          </div>
          
          <div className="short-actions">
            <button className="short-action-btn" onClick={handleLike}>
              <span style={{ filter: hasLiked ? 'hue-rotate(320deg) brightness(1.5)' : 'none', fontSize: '28px' }}>❤️</span>
              <span>{likes >= 1000 ? (likes / 1000).toFixed(1) + 'K' : likes}</span>
            </button>
            <button className="short-action-btn">
              <span style={{ fontSize: '28px' }}>💬</span>
              <span>Share</span>
            </button>
            <div className="short-avatar">
              {(short.profiles?.username || 'U')[0].toUpperCase()}
            </div>
          </div>
        </div>
        
        {/* Play Pause Indicator */}
        {!isPlaying && (
          <div className="short-play-btn" onClick={togglePlay}>▶</div>
        )}
      </div>
    </div>
  )
}
