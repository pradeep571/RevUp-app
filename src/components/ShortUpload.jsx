import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { uploadShort } from '../data/api'
import { uploadImage } from '../lib/uploadImage' // Repurposing this helper for video upload

export default function ShortUpload({ onClose, onUploaded }) {
  const { session } = useAuth()
  const [videoUrl, setVideoUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function handleFiles(files) {
    if (!files || !files[0]) return
    const file = files[0]
    
    // Quick validation
    if (!file.type.startsWith('video/')) {
      setError('Must be a video file (MP4, MOV, etc)')
      return
    }
    
    setUploading(true)
    setError('')
    setProgress(0)
    
    // Fake progress ticker for smooth UI feeling
    const ticker = setInterval(() => {
      setProgress(p => p < 85 ? p + 8 : p)
    }, 200)

    try {
      // Use the generic upload framework but tell it to use the "shorts" bucket
      const url = await uploadImage(file, 'shorts', session.user.id)
      clearInterval(ticker)
      setProgress(100)
      setVideoUrl(url)
    } catch (err) {
      clearInterval(ticker)
      setError("Failed to upload video: " + err.message)
    }
    setUploading(false)
  }

  async function handleSubmit() {
    if (!videoUrl) return
    setUploading(true)
    try {
      await uploadShort({
        user_id: session.user.id,
        video_url: videoUrl,
        caption: caption || 'Check out my ride! 🏎️',
        likes: 0
      })
      onUploaded()
      onClose()
    } catch(err) {
      setError("Failed to save short to database.")
      setUploading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="cp-modal-box" onClick={e => e.stopPropagation()}>
        <div className="cp-header">
          <div className="cp-title">Upload RevUp Short 📹</div>
          <button className="cp-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="cp-body">
          {!videoUrl ? (
            <div 
              className={`img-upload-zone ${uploading ? 'uploading' : ''}`}
              style={{ aspectRatio: '9/16', maxHeight: '400px' }}
              onClick={() => !uploading && inputRef.current?.click()}
            >
              <div className="img-upload-placeholder">
                <div className="img-upload-icon">📹</div>
                <div className="img-upload-label">Select a Short Video</div>
                <div className="img-upload-hint">MP4, MOV · Max 50MB</div>
              </div>
              
              {uploading && (
                <div className="img-upload-progress-wrap">
                  <div className="img-upload-progress-bar" style={{ width: `${progress}%` }} />
                  <span className="img-upload-progress-text">Uploading Video...</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', maxHeight: '400px', display: 'flex', justifyContent: 'center', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              <video src={videoUrl} controls style={{ height: '400px', maxWidth: '100%' }} />
              <button 
                onClick={() => setVideoUrl(null)} 
                style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
              >
                ✕ Remove
              </button>
            </div>
          )}

          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

          <textarea
            className="cp-caption"
            placeholder="Write a caption... #RevUp #TrackDay"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            style={{ marginTop: '16px' }}
          />

          {error && <div className="cp-error">⚠️ {error}</div>}
          
          <button className="cp-submit" onClick={handleSubmit} disabled={uploading || !videoUrl}>
            {uploading ? 'Processing...' : 'Post Short 🔥'}
          </button>
        </div>
      </div>
    </div>
  )
}
