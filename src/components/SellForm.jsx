import { useState } from 'react'

export default function SellForm({ onClose, onList }) {
  const [form, setForm] = useState({ make: '', model: '', year: '', price: '', km: '', location: '', desc: '' })

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  function handleSubmit() {
    if (!form.make || !form.model || !form.price) return
    const emojis = { ferrari: '🏎️', lamborghini: '🏎️', porsche: '🏎️', bmw: '🚗', mercedes: '🚗', tesla: '⚡', nissan: '🚗', default: '🚗' }
    const bgs = ['linear-gradient(160deg,#1a0d0a,#2e1500)', 'linear-gradient(160deg,#0d1117,#141a24)', 'linear-gradient(160deg,#040d12,#0d2030)']
    onList({
      id: Date.now(),
      emoji: emojis[form.make.toLowerCase()] || emojis.default,
      imgBg: bgs[Math.floor(Math.random() * bgs.length)],
      name: `${form.make} ${form.model}`,
      spec: `${form.year} · ${form.km || '—'} km · ${form.location || 'India'}`,
      price: `₹${form.price}`, location: form.location || 'India',
      views: '0', verified: false,
      hp: '—', kmph: '—', sprint: '—', engine: '—',
      features: [], desc: form.desc || 'No description provided.',
      seller: { name: 'You', sub: 'Private Seller · 1 listing', bg: 'linear-gradient(135deg,#f0c040,#e8a020)', color: '#000' },
      category: 'Other',
    })
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <div className="form-title">List Your Car 🚗</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="sell-form-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Make *</label><input className="form-input" name="make" placeholder="e.g. BMW" value={form.make} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Model *</label><input className="form-input" name="model" placeholder="e.g. M4" value={form.model} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Year</label><input className="form-input" name="year" placeholder="e.g. 2021" value={form.year} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Kilometres</label><input className="form-input" name="km" placeholder="e.g. 18000" value={form.km} onChange={handleChange} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Asking Price *</label>
            <div className="price-input-wrap">
              <span className="price-prefix">₹</span>
              <input className="form-input price-input" name="price" placeholder="e.g. 85 L" value={form.price} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" name="location" placeholder="e.g. Bangalore" value={form.location} onChange={handleChange} /></div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" name="desc" placeholder="Describe your car..." value={form.desc} onChange={handleChange} style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>
          <button className="form-submit" onClick={handleSubmit} style={{ opacity: (!form.make || !form.model || !form.price) ? 0.4 : 1 }}>List for Sale 🚗</button>
        </div>
      </div>
    </div>
  )
}



