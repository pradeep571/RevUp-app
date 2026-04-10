import { useState, useEffect } from 'react'
import { fetchCurrentWeek, fetchTopBoostedCars } from '../services/api'
import {
  advanceToRoundOf8,
  advanceToSemifinal,
  advanceToFinal,
  crownWeeklyWinner
} from '../services/admin'
import { supabase } from '../services/supabase'

export default function AdminPage() {
  const [week, setWeek] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function loadData() {
    const w = await fetchCurrentWeek()
    setWeek(w)
  }

  useEffect(() => { loadData() }, [])

  async function handleAdvance(round) {
    if (!week) return
    setLoading(true)
    setMsg(`Advancing to ${round}...`)
    try {
      if (round === 'round_of_8') {
        const topCars = await fetchTopBoostedCars(week.week_number, week.year, 8)
        let topCarIds = topCars.map(c => c.id)
        
        // Auto-fill missing cars if the user hasn't boosted 8 cars yet to make testing easy
        if (topCarIds.length < 8) {
           const { data: allCars } = await supabase.from('cars').select('id').limit(20)
           if (allCars) {
             for (const car of allCars) {
               if (!topCarIds.includes(car.id)) {
                 topCarIds.push(car.id)
               }
               if (topCarIds.length >= 8) break
             }
           }
           
           // If we still don't have 8 unique cars in the database at all
           if (topCarIds.length < 8) {
             alert(`You only have ${topCarIds.length} unique cars returned. Please ensure you have 8 different cars!`)
             setLoading(false)
             return
           }
        }
        await advanceToRoundOf8(week.id, topCarIds)
      } else if (round === 'semifinal') {
        await advanceToSemifinal(week.id)
      } else if (round === 'final') {
        await advanceToFinal(week.id)
      } else if (round === 'crown') {
        await crownWeeklyWinner(week.id, week.week_number, week.year)
      }
      setMsg(`Advanced to ${round}!`)
      await loadData()
    } catch (err) {
      setMsg(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  return (
    <div className="app-layout">
      <div className="feed-col" style={{ padding: 20 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '32px' }}>Admin Dashboard (Time Machine)</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Use these to manually progress the competition for testing.</p>

        {week ? (
          <div className="glass-card" style={{ padding: 24, border: '1px solid var(--border)' }}>
            <h3>Current Week: {week.week_number} ({week.year})</h3>
            <p style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Phase: {week.phase}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              <button 
                className="premium-btn" 
                onClick={() => handleAdvance('round_of_8')} 
                disabled={loading || week.phase !== 'nomination'}
                style={{ opacity: week.phase !== 'nomination' ? 0.5 : 1 }}
              >
                [1] Advance to Round of 8 (Wednesday)
              </button>
              <button 
                className="premium-btn" 
                onClick={() => handleAdvance('semifinal')} 
                disabled={loading || week.phase !== 'round_of_8'}
                style={{ opacity: week.phase !== 'round_of_8' ? 0.5 : 1 }}
              >
                [2] Advance to Semifinals (Thursday)
              </button>
              <button 
                className="premium-btn" 
                onClick={() => handleAdvance('final')} 
                disabled={loading || week.phase !== 'semifinal'}
                style={{ opacity: week.phase !== 'semifinal' ? 0.5 : 1 }}
              >
                [3] Advance to Finals (Friday)
              </button>
              <button 
                className="premium-btn" 
                onClick={() => handleAdvance('crown')} 
                disabled={loading || week.phase !== 'final'}
                style={{ opacity: week.phase !== 'final' ? 0.5 : 1 }}
              >
                [4] Crown Winner (Sunday)
              </button>
            </div>
            {msg && <p style={{ marginTop: 20, color: 'var(--gold)', fontWeight: 'bold' }}>{msg}</p>}
          </div>
        ) : (
          <p>No active competition week. Go to Trending and click "Start Current Week".</p>
        )}
      </div>
    </div>
  )
}
