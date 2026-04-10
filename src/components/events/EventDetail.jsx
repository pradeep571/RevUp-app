import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { attendEvent, leaveEvent, fetchEventAttendeesWithProfiles } from '../../services/api'

export default function EventDetail({ event, attendees, onClose, onUpdateAttendees }) {
  const { session } = useAuth()
  const userId = session?.user?.id
  const isGoing = attendees.includes(userId)
  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    async function loadProfiles() {
      try {
        const data = await fetchEventAttendeesWithProfiles(event.id)
        setProfiles(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadProfiles()
  }, [event.id, attendees.length])

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
      <div className="modal-box event-premium-modal" style={{ maxWidth: '900px', padding: 0 }} onClick={e => e.stopPropagation()}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Left Side: Info */}
          <div style={{ flex: '1 1 500px', padding: '40px' }}>
            <div className="form-header" style={{ padding: 0, border: 'none', marginBottom: 24 }}>
              <div>
                <div className={`event-tag ${event.tag || 'tag-blue'}`} style={{ marginBottom: 12 }}>
                  {event.type} {event.hot && '🔥'}
                </div>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#fff', margin: 0, letterSpacing: '1px', lineHeight: 1 }}>{event.name}</h1>
              </div>
              <button className="modal-close-btn" onClick={onClose} style={{ position: 'absolute', top: 30, right: 30 }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="date-badge">
                  <span className="m">{event.month}</span>
                  <span className="d">{event.day}</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Time & Date</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{event.month} {event.day}, 2026</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Location</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>📍 {event.location}</div>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>About Event</div>
              <p style={{ color: 'var(--text)', lineHeight: 1.6, fontSize: '15px' }}>{event.description || event.desc || "No description provided."}</p>
            </div>

            {/* Attendees Bar */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Attending ({profiles.length})</div>
              <div className="attendee-list">
                {profiles.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Be the first to join!</div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {profiles.map((p, i) => (
                      <div key={i} className="attendee-pill" title={p.profiles?.full_name}>
                        <div className="mini-avatar">{p.profiles?.username?.[0]?.toUpperCase()}</div>
                        <span>{p.profiles?.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              className={isGoing ? "rsvp-btn going" : "rsvp-btn"} 
              onClick={handleRSVP} 
              disabled={loading}
            >
              {loading ? 'Processing...' : isGoing ? '✓ You are going' : 'Join the Meetup'}
            </button>
          </div>

          {/* Right Side: Visual/Map */}
          <div style={{ flex: '1 1 400px', background: '#000', minHeight: 400, position: 'relative' }}>
             <iframe
                width="100%"
                height="100%"
                style={{ border: 0, opacity: 0.7 }}
                loading="lazy"
                allowFullScreen
                src={mapUrl}
              ></iframe>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)' }}></div>
          </div>
        </div>

        <style>{`
          .event-premium-modal {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 24px;
            overflow: hidden;
            position: relative;
          }
          .date-badge {
            background: var(--gold);
            color: #000;
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: 800;
          }
          .date-badge .m { font-size: 10px; line-height: 1; }
          .date-badge .d { font-size: 20px; line-height: 1; }

          .attendee-pill {
            background: var(--bg2);
            border: 1px solid var(--border);
            padding: 4px 12px 4px 4px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: var(--text);
          }
          .mini-avatar {
            width: 24px;
            height: 24px;
            background: var(--gold);
            color: #000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 800;
          }

          .rsvp-btn {
            width: 100%;
            padding: 16px;
            border-radius: 14px;
            border: none;
            background: var(--gold);
            color: #000;
            font-weight: 800;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 20px;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .rsvp-btn.going {
            background: var(--bg2);
            border: 1px solid var(--gold);
            color: var(--gold);
          }
          .rsvp-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(240, 192, 64, 0.3);
          }
        `}</style>
      </div>
    </div>
  )
}
