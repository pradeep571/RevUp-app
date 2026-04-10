import React from 'react'
import './Badge.css'

const BADGE_CONFIG = {
  individual: {
    featured:  { label: 'Featured Build',  icon: '🔥', sub: '1 weekly win',   cls: 'b1' },
    respected: { label: 'Respected Build', icon: '⚡', sub: '1 monthly win',  cls: 'b2' },
    elite:     { label: 'Elite Build',     icon: '🏁', sub: '1 seasonal win', cls: 'b3' },
    legend:    { label: 'Legend',          icon: '👑', sub: 'Car of the Year', cls: 'b4' },
  },
  city: {
    rising:   { label: 'Rising City',      icon: '📍', sub: '1 monthly win',   cls: 'c1' },
    dominant: { label: 'Dominant City',    icon: '🚀', sub: '2 monthly wins',  cls: 'c2' },
    capital:  { label: 'Car Capital',      icon: '🏆', sub: '1 seasonal win',  cls: 'c3' },
    carCity:  { label: 'Car City of India',icon: '👑', sub: 'City of the Year', cls: 'c4' },
  }
}

export default function Badge({ type, set = 'individual', size = 'md' }) {
  const config = BADGE_CONFIG[set]?.[type]
  if (!config) return null

  // Small size - rendered as a pill (used in cards, feeds)
  if (size === 'sm') {
    return (
      <span className={`badge-pill ${config.cls}`}>
        <span className="bp-icon">{config.icon}</span>
        <span className="bp-label">{config.label}</span>
      </span>
    )
  }

  // Large/Title variant - for Hall of Fame or Top Profiles
  if (size === 'title') {
    if (type === 'legend') {
      return (
        <div className="title-card t-gold">
          <div className="title-icon">🥇</div>
          <div>
            <div className="title-name">Car of the Year 2025 — Legend</div>
            <div className="title-desc">Voted by the community · Displayed permanently in Hall of Fame</div>
          </div>
        </div>
      )
    }
    if (type === 'carCity') {
      return (
        <div className="title-card t-city">
          <div className="title-icon">🏙️</div>
          <div>
            <div className="title-name">Car City of India 2025</div>
            <div className="title-desc">Most wins across all seasons · City banner in the app</div>
          </div>
        </div>
      )
    }
  }

  // Default size - rendered as the full rectangular badge
  return (
    <div className={`badge ${config.cls}`}>
      <div className="badge-icon">{config.icon}</div>
      <div className="badge-text">
        <span className="badge-name">{config.label}</span>
        <span className="badge-sub">{config.sub}</span>
      </div>
    </div>
  )
}
