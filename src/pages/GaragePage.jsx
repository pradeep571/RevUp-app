import { useState } from 'react'
import { INITIAL_CARS } from '../data/constants'
import CarCard from '../components/CarCard'
import CarDetail from '../components/CarDetail'
import AddCarForm from '../components/AddCarForm'

export default function GaragePage() {
  const [cars, setCars] = useState(INITIAL_CARS)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('garage')
  const totalHP = cars.reduce((s, c) => s + (parseInt(c.hp) || 0), 0)
  const totalPosts = cars.reduce((s, c) => s + c.posts, 0)

  return (
    <div className="feed-col" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="feed-bar">
        <div><span className="feed-heading">My Garage</span><span className="feed-sub">{cars.length} cars</span></div>
        <button className="create-event-btn" onClick={() => setShowForm(true)}>+ Add Car</button>
      </div>
      <div className="garage-profile">
        <div className="garage-avatar">AK</div>
        <div className="garage-info">
          <div className="garage-name">Arjun Kumar</div>
          <div className="garage-handle">@arjun_drives · Bangalore 📍</div>
        </div>
        <div className="garage-stats">
          <div className="garage-stat"><div className="garage-stat-val">{cars.length}</div><div className="garage-stat-lbl">Cars</div></div>
          <div className="garage-stat"><div className="garage-stat-val">{totalHP.toLocaleString()}</div><div className="garage-stat-lbl">Total HP</div></div>
          <div className="garage-stat"><div className="garage-stat-val">{totalPosts}</div><div className="garage-stat-lbl">Posts</div></div>
        </div>
      </div>
      <div className="garage-tabs">
        {['garage', 'compare'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'garage-tab active' : 'garage-tab'} onClick={() => setActiveTab(tab)}>
            {tab === 'garage' ? '🚗 My Cars' : '⚡ Compare'}
          </button>
        ))}
      </div>
      {activeTab === 'garage' && (
        <div className="cars-grid">
          {cars.map(car => <CarCard key={car.id} car={car} onSelect={setSelected} />)}
          <div className="add-car-tile" onClick={() => setShowForm(true)}>
            <div className="add-car-plus">+</div>
            <div className="add-car-label">Add Car</div>
          </div>
        </div>
      )}
      {activeTab === 'compare' && (
        <div className="compare-table">
          <div className="compare-header">
            <div className="compare-cell compare-label"></div>
            {cars.map(car => (
              <div key={car.id} className="compare-cell compare-car-name">
                <div style={{ fontSize: '22px' }}>{car.emoji}</div>
                <div>{car.make}</div>
                <div style={{ color: 'var(--muted)', fontSize: '10px' }}>{car.model}</div>
              </div>
            ))}
          </div>
          {[{ lbl: 'Year', key: 'year' }, { lbl: 'HP', key: 'hp' }, { lbl: '0–100', key: 'sprint' }, { lbl: 'Top Speed', key: 'kmph' }, { lbl: 'Engine', key: 'engine' }].map(row => (
            <div key={row.lbl} className="compare-row">
              <div className="compare-cell compare-label">{row.lbl}</div>
              {cars.map(car => (
                <div key={car.id} className={`compare-cell ${row.key === 'hp' ? 'compare-highlight' : ''}`}>
                  {car[row.key]}{row.key === 'hp' ? ' hp' : ''}{row.key === 'kmph' ? ' km/h' : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {selected && <CarDetail car={selected} onClose={() => setSelected(null)} />}
      {showForm && <AddCarForm onAdd={car => setCars([...cars, car])} onClose={() => setShowForm(false)} />}
    </div>
  )
}
