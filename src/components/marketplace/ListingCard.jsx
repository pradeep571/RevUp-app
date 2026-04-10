import { useState } from 'react'

export default function ListingCard({ listing, onSelect }) {
  const [saved, setSaved] = useState(false)
  return (
    <div className="listing-card" onClick={() => onSelect(listing)}>
      <div className="listing-img" style={{ background: listing.imgBg }}>
        <span style={{ fontSize: '56px' }}>{listing.emoji}</span>
        <div className="listing-img-top">
          <span className="listing-price">{listing.price}</span>
          {listing.verified && <span className="listing-verified">✓ Verified</span>}
        </div>
        <button className={saved ? 'listing-save-btn saved' : 'listing-save-btn'} onClick={e => { e.stopPropagation(); setSaved(!saved) }}>🔖</button>
      </div>
      <div className="listing-body">
        <div className="listing-name">{listing.name}</div>
        <div className="listing-spec">{listing.spec}</div>
        <div className="listing-meta">
          <span className="listing-loc">📍 {listing.location}</span>
          <span className="listing-views">👁 {listing.views}</span>
        </div>
      </div>
    </div>
  )
}
