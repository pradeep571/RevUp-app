import { useState } from 'react'

export default function ListingDetail({ listing, onClose }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [contacted, setContacted] = useState(false)
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="lmodal-img" style={{ background: listing.imgBg }}>
          <span style={{ fontSize: '80px' }}>{listing.emoji}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="lmodal-price">{listing.price}</div>
        </div>
        <div className="lmodal-body">
          <div className="lmodal-title">{listing.name}</div>
          <div className="lmodal-subtitle">{listing.spec} · 📍 {listing.location}</div>
          <div className="lmodal-spec-strip">
            {[{ v: listing.hp + 'hp', l: 'Power' }, { v: listing.sprint, l: '0–100' }, { v: listing.kmph + 'km/h', l: 'Top Speed' }, { v: listing.engine, l: 'Engine' }].map((s, i) => (
              <div key={i} className="lmodal-spec">
                <div className="lmodal-spec-val" style={{ fontSize: i === 3 ? '10px' : '14px' }}>{s.v}</div>
                <div className="lmodal-spec-lbl">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="lmodal-section">Description</div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '14px' }}>{listing.desc}</p>
          <div className="lmodal-section">Features & Options</div>
          <div className="lmodal-features">
            {listing.features.map((f, i) => <span key={i} className="lmodal-feature">✓ {f}</span>)}
          </div>
          <div className="lmodal-section">Seller</div>
          <div className="lmodal-seller">
            <div className="lmodal-seller-av" style={{ background: listing.seller.bg, color: listing.seller.color }}>{listing.seller.name[0]}</div>
            <div>
              <div className="lmodal-seller-name">{listing.seller.name}</div>
              <div className="lmodal-seller-sub">{listing.seller.sub}</div>
            </div>
            {listing.verified && <div className="lmodal-seller-badge">⭐ Verified</div>}
          </div>
          <div className="lmodal-actions">
            <button className="lmodal-contact" onClick={() => setContacted(true)}>{contacted ? '✓ Request Sent!' : '📞 Contact Seller'}</button>
            <button className={wishlisted ? 'lmodal-wishlist wishlisted' : 'lmodal-wishlist'} onClick={() => setWishlisted(!wishlisted)}>{wishlisted ? '🔖 Saved' : '🔖 Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
