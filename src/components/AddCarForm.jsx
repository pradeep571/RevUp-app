import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addCar } from '../data/api'
import ImageUpload from './ImageUpload'

export default function AddCarForm({ onAdd, onClose }) {
  const { session } = useAuth()
  const [form, setForm] = useState({ make: '', model: '', year: '', hp: '', kmph: '', sprint: '', engine: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  
  const emojis = { ferrari: '🏎️', lamborghini: '🏎️', porsche: '🏎️', bmw: '🚗', mercedes: '🚗', audi: '🚗', tesla: '⚡', nissan: '🚗', toyota: '🚙', default: '🚗' }
  const bgs = ['linear-gradient(160deg,#1a0d0a,#2e1500,#120a08)', 'linear-gradient(160deg,#0d1117,#141a24,#0d1117)', 'linear-gradient(160deg,#040d12,#0d2030,#040d12)', 'linear-gradient(160deg,#0d1700,#142400,#0d1700)']

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSubmit() {
    if (!form.make || !form.model || !form.year) return
    setSubmitting(true)
    setError('')
    
    const dbCar = {
      user_id: session.user.id,
      make: form.make, 
      model: form.model, 
      year: form.year,
      hp: form.hp || '—', 
      kmph: form.kmph || '—', 
      sprint: form.sprint || '—',
      engine: form.engine || 'Unknown engine',
      image_url: imageUrl
    }

    try {
      await addCar(dbCar)
      
      const missingFields = {
        emoji: emojis[form.make.toLowerCase()] || emojis.default,
        imgBg: bgs[Math.floor(Math.random() * bgs.length)],
        mods: [], tag: 'tag-gold', tagLabel: 'My Car', posts: 0, status: 'Active'
      }

      onAdd({ ...dbCar, ...missingFields, id: Date.now() })
      onClose()
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <div className="form-title">Add to Garage</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="form-body">
          <ImageUpload 
            userId={session.user.id}
            folder="cars"
            aspectRatio="16/9"
            label="Upload photo of your car"
            onUploaded={url => setImageUrl(url)}
            onError={msg => setError(msg)}
          />
          <div className="form-row" style={{ marginTop: '16px' }}>
            <div className="form-group"><label className="form-label">Make *</label><input className="form-input" name="make" placeholder="e.g. Ferrari" value={form.make} onChange={handleChange} disabled={submitting} /></div>
            <div className="form-group"><label className="form-label">Model *</label><input className="form-input" name="model" placeholder="e.g. 488 GTB" value={form.model} onChange={handleChange} disabled={submitting} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Year *</label><input className="form-input" name="year" placeholder="e.g. 2022" value={form.year} onChange={handleChange} disabled={submitting} /></div>
            <div className="form-group"><label className="form-label">Engine</label><input className="form-input" name="engine" placeholder="e.g. 3.9L V8" value={form.engine} onChange={handleChange} disabled={submitting} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Horsepower</label><input className="form-input" name="hp" placeholder="e.g. 660" value={form.hp} onChange={handleChange} disabled={submitting} /></div>
            <div className="form-group"><label className="form-label">Top Speed (km/h)</label><input className="form-input" name="kmph" placeholder="e.g. 330" value={form.kmph} onChange={handleChange} disabled={submitting} /></div>
          </div>
          <div className="form-group"><label className="form-label">0–100 km/h</label><input className="form-input" name="sprint" placeholder="e.g. 3.0s" value={form.sprint} onChange={handleChange} disabled={submitting} /></div>
          
          {error && <div style={{ color: '#ff4d2e', fontSize: '12px' }}>⚠️ {error}</div>}
          
          <button 
            className="form-submit" 
            onClick={handleSubmit} 
            disabled={submitting || !form.make || !form.model || !form.year}
            style={{ opacity: (!form.make || !form.model || !form.year || submitting) ? 0.4 : 1 }}
          >
            {submitting ? 'Adding...' : 'Add to Garage 🚗'}
          </button>
        </div>
      </div>
    </div>
  )
}
