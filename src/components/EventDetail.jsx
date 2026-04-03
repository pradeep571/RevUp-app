import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { attendEvent, leaveEvent } from '../data/api'

export default function EventDetail({ event, attendees, onClose, onUpdateAttendees }) {
  const { session } = useAuth()
  const userId = session?.user?.id
  const isGoing = attendees.includes(userId)
  const [loading, setLoading] = useState(false)

  // We use the event location to generate a free iframe map from Google Maps
  const mapQuery = encodeURIComponent(event.location)
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`

  async function handleRSVP() {
    if (!userId) return
    setLoading(true)
    try {
      if (isGoing) {
        await leaveEvent(event.id, userId)
        onUpdateAttendees(event.id, attendees.filter(id => id !== userId))
      } else {
        await attendEvent(event.id, userId)
        onUpdateAttendees(event.id, [...attendees, userId])
      }
    } catch (err) {
      console.error(err)
      alert("Could not update RSVP status.")
    }
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
      {/* Event modal will be slightly wider for the map */}
      <div className="modal-box" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        
        {/* Header Section */}
        <div className="form-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div>
            <div className={`event-tag ${event.tag || 'tag-blue'}`} style={{ display: 'inline-block', marginBottom: '8px' }}>
              {event.type} {event.hot && '🔥'}
            </div>
            <div className="form-title" style={{ fontSize: '28px' }}>{event.name}</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Content Section */}
        <div className="form-body" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '16px' }}>
          
          {/* Left Column: Details */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="event-date event-date-active" style={{ position: 'relative' }}>
                <div className="event-month">{event.month}</div>
                <div className="event-day">{event.day}</div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{event.month} {event.day}, 2026</div>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Location</div>
              <div style={{ fontWeight: '500', fontSize: '16px' }}>📍 {event.location}</div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Details</div>
              <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>{event.description || event.desc || "No description provided."}</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{attendees.length}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Going to this event</div>
              </div>
              <button 
                className={isGoing ? "event-join-btn going" : "event-join-btn"} 
                onClick={handleRSVP} 
                disabled={loading}
                style={{ cursor: loading ? 'wait' : 'pointer' }}
              >
                {loading ? '...' : isGoing ? '✓ You are going' : 'Join Event'}
              </button>
            </div>
          </div>

          {/* Right Column: Google Maps Iframe */}
          <div style={{ flex: '1 1 350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', minHeight: '350px', position: 'relative' }}>
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapUrl}
            ></iframe>
          </div>

        </div>
      </div>
    </div>
  )
}
