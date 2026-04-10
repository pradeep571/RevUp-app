import { useEffect, useState } from 'react'
import { fetchCarBadges } from '../../services/api'
import Badge from '../common/Badge'

export default function CarCard({ car, onSelect }) {
  const [badges, setBadges] = useState([])
  useEffect(() => {
    if (car.id) fetchCarBadges(car.id).then(setBadges)
  }, [car.id])

  return (
    <div className="car-card" onClick={() => onSelect(car)}>
      {car.image_url ? (
        <div className="car-card-img" style={{ backgroundImage: `url(${car.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="car-card-img-overlay"><span className={`event-tag ${car.tag}`}>{car.tagLabel}</span></div>
        </div>
      ) : (
        <div className="car-card-img" style={{ background: car.imgBg }}>
          <span style={{ fontSize: '52px' }}>{car.emoji}</span>
          <div className="car-card-img-overlay"><span className={`event-tag ${car.tag}`}>{car.tagLabel}</span></div>
        </div>
      )}
      <div className="car-card-body">
        <div className="car-card-name">{car.year} {car.make} {car.model}</div>
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            {badges.map(b => <Badge key={b.badge_type} type={b.badge_type} set="individual" size="sm" />)}
          </div>
        )}
        <div className="car-card-engine">{car.engine}</div>
        <div className="car-card-specs">
          {[{ v: car.hp, l: 'HP' }, { v: car.sprint, l: '0–100' }, { v: car.kmph, l: 'Top km/h' }].map((s, i) => (
            <div key={i} className="car-mini-spec">
              <div className="car-mini-val">{s.v}</div>
              <div className="car-mini-lbl">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="car-card-footer">
          <span className="car-posts">{car.posts} posts</span>
          <span className="car-status">{car.status}</span>
        </div>
      </div>
    </div>
  )
}
