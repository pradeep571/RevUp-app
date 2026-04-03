import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { deleteCar } from '../data/api'

export default function CarDetail({ car, onClose, onDelete }) {
  const { session } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const isOwner = session?.user?.id === car.user_id

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete your ${car.year} ${car.make} ${car.model}?`)) return
    setDeleting(true)
    try {
      await deleteCar(car.id)
      onDelete(car.id)
    } catch (err) {
      alert("Error deleting car: " + err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {car.image_url ? (
          <div className="modal-img" style={{ backgroundImage: `url(${car.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <button className="modal-close" onClick={onClose}>✕</button>
            <div className="modal-img-overlay"><span className={`event-tag ${car.tag}`}>{car.tagLabel}</span></div>
          </div>
        ) : (
          <div className="modal-img" style={{ background: car.imgBg }}>
            <span style={{ fontSize: '80px' }}>{car.emoji}</span>
            <button className="modal-close" onClick={onClose}>✕</button>
            <div className="modal-img-overlay"><span className={`event-tag ${car.tag}`}>{car.tagLabel}</span></div>
          </div>
        )}
        <div className="modal-body">
          <div className="modal-title">{car.year} {car.make} {car.model}</div>
          <div className="modal-engine">{car.engine}</div>
          <div className="modal-spec-strip">
            {[{ v: car.hp, l: 'HP' }, { v: car.sprint, l: '0–100 km/h' }, { v: car.kmph, l: 'Top Speed' }].map((s, i) => (
              <div key={i} className="modal-spec"><div className="modal-spec-val">{s.v}</div><div className="modal-spec-lbl">{s.l}</div></div>
            ))}
          </div>
          <div className="modal-section-title">Modifications</div>
          <div className="modal-mods">
            {(!car.mods || car.mods.length === 0)
              ? <div className="modal-mod" style={{ color: 'var(--muted)' }}>No mods added yet</div>
              : car.mods.map((mod, i) => <div key={i} className="modal-mod">🔧 {mod}</div>)
            }
          </div>
          <div className="modal-actions">
            <button className="modal-post-btn">📸 Post this car</button>
            {isOwner && (
              <button 
                className="modal-edit-btn" 
                onClick={handleDelete}
                disabled={deleting}
                style={{ color: '#ff4d2e', borderColor: 'rgba(255, 77, 46, 0.3)' }}
              >
                {deleting ? '...' : '🗑️ Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
