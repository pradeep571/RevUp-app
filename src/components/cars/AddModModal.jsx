import { useState } from 'react'
import { addCarMod } from '../../services/api'

export default function AddModModal({ carId, onAdd, onClose }) {
  const [category, setCategory] = useState('Performance')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = ['Performance', 'Aesthetic', 'Interior', 'Handling', 'Audio']

  async function handleSubmit() {
    if (!description) return
    setLoading(true)
    try {
      await addCarMod(carId, category, description)
      onAdd({ category, description, created_at: new Date().toISOString() })
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to add mod")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <div className="form-title">Add Modification</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="form-body">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-input" 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Modification Details</label>
            <textarea 
              className="form-input" 
              placeholder="e.g. Stage 2 ECU Tune, Brembo Big Brake Kit..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>
          <button 
            className="premium-btn" 
            onClick={handleSubmit}
            disabled={loading || !description}
            style={{ width: '100%', marginTop: 10 }}
          >
            {loading ? 'Adding...' : 'Add Mod 🛠️'}
          </button>
        </div>
      </div>
    </div>
  )
}
