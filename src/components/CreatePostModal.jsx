import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createPost } from '../data/api'
import ImageUpload from './ImageUpload'

export default function CreatePostModal({ onClose, onPosted }) {
  const { session } = useAuth()
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
      await createPost({
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
