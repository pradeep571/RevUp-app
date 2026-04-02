import { useState } from 'react'
import { EVENTS, EVENT_FILTERS } from '../data/constants'
import EventCard from '../components/EventCard'

export default function EventsPage() {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? EVENTS : EVENTS.filter(e => e.type === filter || e.location.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="feed-col" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="feed-bar">
        <div><span className="feed-heading">Events</span><span className="feed-sub">Bangalore & beyond 📍</span></div>
        <button className="create-event-btn">+ Create</button>
      </div>
      <div className="chips">
        {EVENT_FILTERS.map(f => <button key={f} className={filter === f ? 'chip active' : 'chip'} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="events-list">
        {filtered.length === 0 ? <div className="events-empty">No events found 🚗</div> : filtered.map(event => <EventCard key={event.id} event={event} />)}
      </div>
    </div>
  )
}
