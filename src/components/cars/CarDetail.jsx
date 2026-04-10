import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { 
  deleteCar, fetchCarImages, addCarImage, 
  fetchCarMods, deleteCarMod 
} from '../../services/api'
import ImageUpload from './ImageUpload'
import AddModModal from './AddModModal'
import Badge from '../common/Badge'

export default function CarDetail({ car, onClose, onDelete, onUpdate }) {
  const { session } = useAuth()
  const [images, setImages] = useState([])
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddMod, setShowAddMod] = useState(false)
  const [showAddImg, setShowAddImg] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = session?.user?.id === car.user_id

  useEffect(() => {
    async function load() {
      try {
        const [imgs, ms] = await Promise.all([
          fetchCarImages(car.id),
          fetchCarMods(car.id)
        ])
        setImages(imgs)
        setMods(ms)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [car.id])

  async function handleDelete() {
    if (!window.confirm(`Are you sure?`)) return
    setDeleting(true)
    try {
      await deleteCar(car.id)
      onDelete(car.id)
    } catch (err) {
      alert(err.message)
      setDeleting(false)
    }
  }

  async function handleAddImage(url) {
    try {
      await addCarImage(car.id, url)
      setImages(prev => [...prev, { image_url: url, created_at: new Date().toISOString() }])
      setShowAddImg(false)
    } catch (err) { console.error(err) }
  }

  const groupedMods = mods.reduce((acc, mod) => {
    acc[mod.category] = acc[mod.category] || []
    acc[mod.category].push(mod)
    return acc
  }, {})

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1050 }}>
      <div className="modal-box premium-detail" style={{ maxWidth: 800, padding: 0 }} onClick={e => e.stopPropagation()}>
        
        {/* Gallery Section */}
        <div className="detail-gallery">
          <div className="gallery-scroll">
            {images.length === 0 ? (
              <div className="gallery-slide" style={{ backgroundImage: `url(${car.image_url})` }}></div>
            ) : (
              images.map((img, i) => (
                <div key={i} className="gallery-slide" style={{ backgroundImage: `url(${img.image_url})` }}></div>
              ))
            )}
          </div>
          <button className="modal-close" onClick={onClose} style={{ top: 20, right: 20 }}>✕</button>
          
          <div className="gallery-overlay">
            <div className="gallery-info">
              <h1 className="detail-title">{car.year} {car.make} {car.model}</h1>
              <div className="detail-engine">{car.engine}</div>
            </div>
            {isOwner && (
              <button className="add-img-btn" onClick={() => setShowAddImg(true)}>+ Photo</button>
            )}
          </div>
        </div>

        <div className="detail-content">
          {/* Specs */}
          <div className="detail-specs">
            {[{ v: car.hp, l: 'HP' }, { v: car.sprint, l: '0–100' }, { v: car.kmph, l: 'Top Speed' }].map((s, i) => (
              <div key={i} className="spec-item-box">
                <div className="spec-val-big">{s.v}</div>
                <div className="spec-lbl-small">{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* Mods List */}
            <div style={{ flex: 1, minWidth: 300 }}>
              <div className="section-header">
                <h2 className="section-title">🛠️ Build Sheet</h2>
                {isOwner && <button className="add-mod-small" onClick={() => setShowAddMod(true)}>+ Add Mod</button>}
              </div>
              
              {mods.length === 0 ? (
                <div className="empty-state">No modifications listed yet.</div>
              ) : (
                Object.entries(groupedMods).map(([cat, items]) => (
                  <div key={cat} className="mod-category">
                    <div className="mod-cat-name">{cat}</div>
                    {items.map(m => (
                      <div key={m.id} className="mod-entry">
                        <span className="mod-dot">•</span>
                        {m.description}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Sidebar info */}
            <div style={{ width: 180 }}>
              <div className="section-header">
                <h2 className="section-title">🏆 Status</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Badge type="featured" size="md" />
                <div className="sidebar-stat">
                  <div className="stat-label">Nominations</div>
                  <div className="stat-value">128 Boosts</div>
                </div>
              </div>

              {isOwner && (
                <button className="delete-car-btn" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : '🗑️ Remove Car'}
                </button>
              )}
            </div>
          </div>
        </div>

        {showAddMod && <AddModModal carId={car.id} onAdd={m => setMods(prev => [...prev, m])} onClose={() => setShowAddMod(false)} />}
        {showAddImg && (
          <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setShowAddImg(false)}>
            <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div className="form-header">
                <div className="form-title">Upload Gallery Photo</div>
                <button className="modal-close-btn" onClick={() => setShowAddImg(false)}>✕</button>
              </div>
              <div className="form-body">
                <ImageUpload 
                  userId={session.user.id} folder="cars" aspectRatio="16/9"
                  onUploaded={handleAddImage}
                />
              </div>
            </div>
          </div>
        )}

        <style>{`
          .premium-detail {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 24px;
            overflow: hidden;
            animation: slideUp 0.3s ease-out;
          }
          @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

          .detail-gallery {
            height: 400px;
            position: relative;
            background: #000;
          }
          .gallery-scroll {
            display: flex;
            height: 100%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
          }
          .gallery-slide {
            flex: 0 0 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            scroll-snap-align: start;
          }
          .gallery-overlay {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 40px 30px 20px;
            background: linear-gradient(transparent, rgba(0,0,0,0.9));
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .detail-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 42px;
            letter-spacing: 1px;
            color: #fff;
            margin: 0;
          }
          .detail-engine {
            color: var(--gold);
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .add-img-btn {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }

          .detail-content {
            padding: 30px;
          }
          .detail-specs {
            display: flex;
            gap: 12px;
            margin-bottom: 32px;
          }
          .spec-item-box {
            flex: 1;
            background: var(--bg2);
            border: 1px solid var(--border);
            padding: 16px 12px;
            border-radius: 16px;
            text-align: center;
          }
          .spec-val-big {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 24px;
            color: var(--gold);
          }
          .spec-lbl-small {
            font-size: 10px;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 2px;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .add-mod-small {
            background: none;
            border: 1px solid var(--gold);
            color: var(--gold);
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
          }
          .mod-category {
            margin-bottom: 20px;
          }
          .mod-cat-name {
            font-size: 11px;
            font-weight: 800;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
          }
          .mod-entry {
            font-size: 14px;
            color: var(--text);
            padding: 6px 0;
            display: flex;
            gap: 10px;
            border-bottom: 1px solid var(--border);
          }
          .mod-dot { color: var(--gold); }
          .empty-state { color: var(--muted); font-size: 14px; padding: 20px 0; }

          .sidebar-stat {
            background: var(--bg2);
            border: 1px solid var(--border);
            padding: 12px;
            border-radius: 12px;
            margin-top: 10px;
          }
          .stat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; }
          .stat-value { font-size: 15px; font-weight: 700; color: var(--text); }

          .delete-car-btn {
            background: none;
            border: 1px solid rgba(255, 77, 46, 0.2);
            color: #ff4d2e;
            width: 100%;
            padding: 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            margin-top: 32px;
            cursor: pointer;
          }
        `}</style>
      </div>
    </div>
  )
}
