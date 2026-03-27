import { useState, useRef, useCallback } from 'react'
import { uploadImage } from '../lib/uploadImage'

export default function ImageUpload({
  userId,
  folder = 'posts',
  onUploaded,
  onError,
  existingUrl = null,
  aspectRatio = '4/3',
  label = 'Drop photo here or click to upload',
  compact = false,
}) {
  const [preview,   setPreview]   = useState(existingUrl)
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [dragOver,  setDragOver]  = useState(false)
  const inputRef = useRef(null)

  const processFile = useCallback(async (file) => {
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)
    setProgress(0)

    const ticker = setInterval(() => {
      setProgress(p => p < 85 ? p + 12 : p)
    }, 120)

    try {
      const url = await uploadImage(file, folder, userId)
      clearInterval(ticker)
      setProgress(100)
      setTimeout(() => { setProgress(0); setUploading(false) }, 600)
      URL.revokeObjectURL(objectUrl)
      setPreview(url)
      onUploaded?.(url)
    } catch (err) {
      clearInterval(ticker)
      setUploading(false)
      setProgress(0)
      setPreview(existingUrl)
      onError?.(err.message)
    }
  }, [folder, userId, existingUrl, onUploaded, onError])

  function handleFiles(files) {
    if (files && files[0]) processFile(files[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  if (compact) {
    return (
      <div
        className="img-upload-avatar"
        onClick={() => !uploading && inputRef.current?.click()}
        title="Change photo"
      >
        {preview
          ? <img src={preview} alt="avatar" className="img-upload-avatar-img" />
          : <span className="img-upload-avatar-placeholder">📷</span>
        }
        {uploading
          ? <div className="img-upload-avatar-loading">⏳</div>
          : <div className="img-upload-avatar-edit">✏️</div>
        }
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
    )
  }

  return (
    <div className="img-upload-wrap">
      <div
        className={`img-upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        style={{ aspectRatio }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="img-upload-preview" />
            {!uploading && (
              <div className="img-upload-preview-overlay">
                <span>🔄 Change photo</span>
              </div>
            )}
          </>
        ) : (
          <div className="img-upload-placeholder">
            <div className="img-upload-icon">📸</div>
            <div className="img-upload-label">{label}</div>
            <div className="img-upload-hint">JPG, PNG, WEBP · max 10 MB</div>
          </div>
        )}

        {uploading && (
          <div className="img-upload-progress-wrap">
            <div className="img-upload-progress-bar" style={{ width: `${progress}%` }} />
            <span className="img-upload-progress-text">Uploading…</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}