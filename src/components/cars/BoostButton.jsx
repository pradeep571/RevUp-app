import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchUserBoostThisWeek, boostCar, removeboost } from '../../services/api'

function getCurrentWeekAndYear() {
  const now = new Date()
  const year = now.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const weekNumber = Math.ceil(((now - jan4) / 86400000 + jan4.getDay() + 1) / 7)
  return { weekNumber, year }
}

export default function BoostButton({ car }) {
  const { session } = useAuth()
  const [boostedCarId, setBoostedCarId] = useState(null)
  const [loading, setLoading] = useState(false) // Initialized to false to avoid permanent disable
  const [initialFetchDone, setInitialFetchDone] = useState(false)
  const { weekNumber, year } = getCurrentWeekAndYear()

  const userId = session?.user?.id
  const isBoosted = boostedCarId === car.id
  const hasBoostedOther = boostedCarId && boostedCarId !== car.id

  useEffect(() => {
    if (!userId || initialFetchDone) return
    
    async function loadBoostStatus() {
      try {
        const b = await fetchUserBoostThisWeek(userId, weekNumber, year)
        setBoostedCarId(b?.car_id || null)
      } catch (err) {
        console.error("Boost fetch error:", err)
      } finally {
        setInitialFetchDone(true)
      }
    }
    loadBoostStatus()
  }, [userId, weekNumber, year, initialFetchDone])

  async function handleBoost() {
    if (loading || !userId) return
    setLoading(true)
    try {
      if (isBoosted) {
        await removeboost(userId, weekNumber, year)
        setBoostedCarId(null)
      } else {
        // If they had boosted another car, remove that boost first
        if (boostedCarId) {
          await removeboost(userId, weekNumber, year)
        }
        await boostCar(car.id, userId, weekNumber, year)
        setBoostedCarId(car.id)
      }
    } catch (e) {
      console.error("Boosting error:", e)
      alert("Failed to update boost. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBoost}
      disabled={loading || !initialFetchDone}
      title={hasBoostedOther ? 'Tap to switch your boost to this car' : ''}
      className={`boost-btn-premium ${isBoosted ? 'boosted' : ''} ${hasBoostedOther ? 'has-other' : ''}`}
    >
      <span className="boost-icon">{isBoosted ? '⚡' : '🚀'}</span>
      <span className="boost-text">
        {loading ? 'Processing...' : isBoosted ? 'BOOSTED' : 'BOOST THIS CAR'}
      </span>

      <style>{`
        .boost-btn-premium {
          width: 100%;
          margin-top: 10px;
          padding: 10px 0;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.03);
          color: var(--muted);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 15px;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .boost-btn-premium:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.07);
          border-color: var(--muted);
          color: var(--text);
          transform: translateY(-1px);
        }

        .boost-btn-premium:active:not(:disabled) {
          transform: scale(0.98);
        }

        .boost-btn-premium.boosted {
          background: var(--gold);
          border-color: var(--gold);
          color: #000;
          box-shadow: 0 0 15px rgba(240, 192, 64, 0.3);
        }

        .boost-btn-premium.boosted:hover {
          box-shadow: 0 0 20px rgba(240, 192, 64, 0.5);
          transform: translateY(-2px);
        }

        .boost-btn-premium.has-other {
          opacity: 0.7;
        }

        .boost-btn-premium.has-other:hover {
          opacity: 1;
          border-color: var(--gold);
          color: var(--gold);
        }

        .boost-icon {
          font-size: 16px;
          transition: transform 0.3s;
        }

        .boost-btn-premium.boosted .boost-icon {
          transform: scale(1.2);
          filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
        }

        .boost-btn-premium:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .boost-text {
          margin-top: 2px;
        }
      `}</style>
    </button>
  )
}
