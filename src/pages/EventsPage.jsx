import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { EVENT_FILTERS } from '../data/constants'
import { fetchEvents, fetchEventAttendees, injectDummyEvents } from '../data/api'
import EventCard from '../components/EventCard'
import EventDetail from '../components/EventDetail'

export default function EventsPage() {
  const { session } = useAuth()
  const [filter, setFilter] = useState('All')
  const [events, setEvents] = useState([])
  const [attendeesMap, setAttendeesMap] = useState({}) // { eventId: [userIds] }
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    async function loadEvents() {
      if (!session?.user?.id) return
      try {
        let data = await fetchEvents()
        
        // Auto-inject dummy events if the table is completely empty
        if (data.length === 0) {
          await injectDummyEvents(session.user.id)
          data = await fetchEvents()
        }

        const attendeesData = {}
        await Promise.all(data.map(async (ev) => {
          const attendingIds = await fetchEventAttendees(ev.id)
          attendeesData[ev.id] = attendingIds.map(a => a.user_id)
        }))

        setEvents(data)
        setAttendeesMap(attendeesData)
      } catch (err) {
        console.error("Failed to load events", err)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [session?.user?.id])

  function handleUpdateAttendees(eventId, newAttendees) {
    setAttendeesMap(prev => ({ ...prev, [eventId]: newAttendees }))
  }

  const enrichedEvents = events.map(ev => ({
    ...ev,
    attendeesCount: (attendeesMap[ev.id] || []).length
  }))

  const filtered = filter === 'All' 
    ? enrichedEvents 
    : enrichedEvents.filter(e => e.type === filter || e.location.toLowerCase().includes(filter.toLowerCase()))

  if (loading) {
    return <div className="feed-col" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>Finding local events... 📍</div>
  }

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
        {filtered.length === 0 ? (
          <div className="events-empty">No events found 🚗</div>
        ) : (
          filtered.map(event => <EventCard key={event.id} event={event} onClick={setSelectedEvent} />)
        )}
      </div>

      {selectedEvent && (
        <EventDetail 
          event={selectedEvent} 
          attendees={attendeesMap[selectedEvent.id] || []}
          onClose={() => setSelectedEvent(null)}
          onUpdateAttendees={handleUpdateAttendees}
        />
      )}
    </div>
  )
}
