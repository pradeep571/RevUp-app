import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotificationsDropdown({ notifications, onMarkRead, onClose }) {
  const navigate = useNavigate()

  const getNotificationText = (notif) => {
    const actor = notif.profiles?.full_name || notif.profiles?.username || 'A racer'
    switch (notif.type) {
      case 'like': return <><b>{actor}</b> liked your post</>
      case 'comment': return <><b>{actor}</b> commented on your post</>
      case 'follow': return <><b>{actor}</b> started following you</>
      case 'event_join': return <><b>{actor}</b> is attending your event</>
      default: return <><b>{actor}</b> interacted with you</>
    }
  }

  const handleNotificationClick = (notif) => {
    onMarkRead(notif.id)
    
    // Logic for where to navigate based on type
    if (notif.type === 'like' || notif.type === 'comment') {
      navigate('/feed') // Or a specific post page if you add one later
    } else if (notif.type === 'follow') {
      navigate(`/profile/${notif.actor_id}`)
    } else if (notif.type === 'event_join') {
      navigate('/events')
    }
    
    onClose()
  }

  return (
    <div className="notif-dropdown">
      <div className="notif-header">
        <span>CREW ACTIVITY</span>
        {notifications.length > 0 && <span className="notif-clear">Recent</span>}
      </div>
      
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">No activity yet. Go start a race! 🏁</div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`notif-item ${!n.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="notif-avatar">
                {(n.profiles?.full_name || n.profiles?.username || '?')[0].toUpperCase()}
              </div>
              <div className="notif-content">
                <div className="notif-text">{getNotificationText(n)}</div>
                <div className="notif-time">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {!n.is_read && <div className="notif-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
