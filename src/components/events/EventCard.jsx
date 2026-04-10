export default function EventCard({ event, onClick }) {
  // Use real backend attendee count if available, gracefully defaulting to the mock 'going' for dummy data
  const attendeesCount = event.attendeesCount ?? event.going ?? 0

  return (
    <div className="event-card" onClick={() => onClick(event)} style={{ cursor: 'pointer' }}>
      <div className="event-date">
        <div className="event-month">{event.month}</div>
        <div className="event-day">{event.day}</div>
      </div>
      <div className="event-body">
        <div className="event-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="event-name">{event.name}</div>
            <div className="event-location" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📍 {event.location}</div>
          </div>
          <div className="event-going-box" style={{ background: 'var(--surface-light)' }}>
            <div className="event-going-count">{attendeesCount >= 1000 ? (attendeesCount / 1000).toFixed(1) + 'K' : attendeesCount}</div>
            <div className="event-going-label">going</div>
          </div>
        </div>
        <div className="event-tags-row" style={{ marginTop: '12px' }}>
          <span className={`event-tag ${event.tag || 'tag-blue'}`}>{event.type}</span>
          {event.hot && <span className="event-tag tag-hot">🔥 Hot</span>}
        </div>
      </div>
    </div>
  )
}
