import React, { useEffect, useState } from 'react'

export default function Toast({ notification, onClose }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(), 300)
  }

  if (!notification) return null

  const getNotifText = () => {
    const actor = notification.profiles?.full_name || notification.profiles?.username || 'A racer'
    switch (notification.type) {
      case 'like': return <span><b>{actor}</b> liked your post</span>
      case 'comment': return <span><b>{actor}</b> commented on your post</span>
      case 'follow': return <span><b>{actor}</b> started following you</span>
      case 'event_join': return <span><b>{actor}</b> is attending your event</span>
      default: return <span>New activity from <b>{actor}</b></span>
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'like': return '❤️'
      case 'comment': return '💬'
      case 'follow': return '👤'
      case 'event_join': return '🏁'
      default: return '⚡'
    }
  }

  return (
    <div className={`toast-overlay ${isExiting ? 'exit' : ''}`} onClick={handleClose}>
      <div className="toast-container">
        <div className="toast-icon">{getIcon()}</div>
        <div className="toast-content">
          <div className="toast-title">NEW ACTIVITY</div>
          <div className="toast-message">{getNotifText()}</div>
        </div>
        <div className="toast-close">✕</div>
        <div className="toast-progress"></div>
      </div>
    </div>
  )
}
