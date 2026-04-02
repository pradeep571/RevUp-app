export default function CarDetail({ car, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-img" style={{ background: car.imgBg }}>
          <span style={{ fontSize: '80px' }}>{car.emoji}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="modal-img-overlay"><span className={`event-tag ${car.tag}`}>{car.tagLabel}</span></div>
        </div>
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
            {car.mods.length === 0
              ? <div className="modal-mod" style={{ color: 'var(--muted)' }}>No mods added yet</div>
              : car.mods.map((mod, i) => <div key={i} className="modal-mod">🔧 {mod}</div>)
            }
          </div>
          <div className="modal-actions">
            <button className="modal-post-btn">📸 Post this car</button>
            <button className="modal-edit-btn">✏️ Edit</button>
          </div>
        </div>
      </div>
    </div>
  )
}
