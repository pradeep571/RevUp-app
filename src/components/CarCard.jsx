export default function CarCard({ car, onSelect }) {
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
