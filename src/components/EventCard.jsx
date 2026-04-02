import { useState } from 'react'

export default function EventCard({ event }) {
  const [going, setGoing] = useState(false)
  const [count, setCount] = useState(event.going)
  const [expanded, setExpanded] = useState(false)

  function handleGoing() {
    setGoing(!going)
    setCount(going ? count - 1 : count + 1)
  }

  return (
    <div className={`event-card ${going ? 'event-card-going' : ''}`}>
      <div className={`event-date ${going ? 'event-date-active' : ''}`}>
        <div className="event-month">{event.month}</div>
        <div className="event-day">{event.day}</div>
      </div>
      <div className="event-body">
        <div className="event-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="event-name">{event.name}</div>
            <div className="event-location">📍 {event.location}</div>
          </div>
          <div className="event-going-box">
            <div className="event-going-count">{count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count}</div>
            <div className="event-going-label">going</div>
          </div>
        </div>
        <div className="event-tags-row">
          <span className={`event-tag ${event.tag}`}>{event.type}</span>
          {event.hot && <span className="event-tag tag-hot">🔥 Hot</span>}
        </div>
        {expanded && <p className="event-desc">{event.desc}</p>}
        <div className="event-actions">
          <button className="event-more" onClick={() => setExpanded(!expanded)}>{expanded ? 'Less ▲' : 'More info ▼'}</button>
          <button className={going ? 'event-join-btn going' : 'event-join-btn'} onClick={handleGoing}>{going ? '✓ Going' : 'Join'}</button>
        </div>
      </div>
    </div>
  )
}
