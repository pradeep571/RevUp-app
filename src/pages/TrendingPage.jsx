import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchCurrentWeek, fetchTopBoostedCars, fetchMatchups,
  fetchUserVote, voteOnMatchup, fetchCityLeaderboard,
  fetchHallOfFame, initializeCompetitionWeek
} from '../services/api'
import Badge from '../components/common/Badge'
import { supabase } from '../services/supabase'
function getCurrentWeekAndYear() {
  const now = new Date()
  const year = now.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const weekNumber = Math.ceil(((now - jan4) / 86400000 + jan4.getDay() + 1) / 7)
  return { weekNumber, year }
}

export default function TrendingPage() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const { weekNumber, year } = getCurrentWeekAndYear()

  const [week, setWeek] = useState(null)
  const [phase, setPhase] = useState('nomination')
  const [topCars, setTopCars] = useState([])
  const [matchups, setMatchups] = useState([])
  const [userVotes, setUserVotes] = useState({})
  const [cityBoard, setCityBoard] = useState([])
  const [hofWinners, setHofWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [initLoading, setInitLoading] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const w = await fetchCurrentWeek()
      setWeek(w)
      const p = w?.phase || 'nomination'
      setPhase(p)

      const [top, cities, hof] = await Promise.all([
        fetchTopBoostedCars(weekNumber, year, 8),
        fetchCityLeaderboard(weekNumber, year),
        fetchHallOfFame()
      ])
      setTopCars(top)
      setCityBoard(cities)
      setHofWinners(hof)

      if (w && p !== 'nomination' && p !== 'completed') {
        const m = await fetchMatchups(w.id, p)
        setMatchups(m)
        if (userId) {
          const votes = {}
          await Promise.all(m.map(async mu => {
            votes[mu.id] = await fetchUserVote(mu.id, userId)
          }))
          setUserVotes(votes)
        }
      }
    } catch (err) {
      console.error("Failed to load trending data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Realtime subscription for matchup score updates
    const channel = supabase
      .channel('matchup-votes-arena')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matchups' },
        (payload) => {
          setMatchups(prev => prev.map(m => 
            m.id === payload.new.id 
              ? { ...m, votes_a: payload.new.votes_a, votes_b: payload.new.votes_b } 
              : m
          ))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, weekNumber, year])

  async function handleVote(matchup, car, isCarA) {
    if (!userId || userVotes[matchup.id]) return
    try {
      await voteOnMatchup(matchup.id, userId, car.id, isCarA)
      setUserVotes(v => ({ ...v, [matchup.id]: car.id }))
      setMatchups(prev => prev.map(m =>
        m.id === matchup.id
          ? { ...m, votes_a: m.votes_a + (isCarA ? 1 : 0), votes_b: m.votes_b + (!isCarA ? 1 : 0) }
          : m
      ))
    } catch (e) { console.error(e) }
  }

  async function handleInit() {
    setInitLoading(true)
    try {
      await initializeCompetitionWeek(weekNumber, year)
      await loadData()
    } catch (err) {
      alert("Initialization failed: " + err.message)
    } finally {
      setInitLoading(false)
    }
  }

  if (loading) return (
    <div className="app-layout">
      <div className="feed-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔥</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Syncing competition data...</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app-layout">
      <div className="feed-col" style={{ maxWidth: 560 }}>
        
        {/* Modern Header */}
        <div className="feed-bar" style={{ padding: '32px 20px' }}>
          <div>
            <span className="feed-heading" style={{ fontSize: '32px', letterSpacing: '2px' }}>TRENDING</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span className="feed-sub" style={{ fontSize: '14px', color: 'var(--muted)' }}>CAR OF THE WEEK ARENA</span>
              <span style={{ fontSize: '16px' }}>🏆</span>
            </div>
          </div>
          <div className="phase-pill" style={{ padding: '8px 16px' }}>
            <span className="phase-dot" />
            {phase.replace(/_/g, ' ')}
          </div>
        </div>

        <div style={{ padding: '0 20px 60px' }}>

          {/* ── NOT ACTIVE FALLBACK ─────────── */}
          {!week && (
            <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: '42px', marginBottom: 16 }}>🏁</div>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', letterSpacing: '1px', marginBottom: 12 }}>Competition Starting Soon</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
                The Car of the Week arena is being prepared. Stay tuned to nominate your build and vote for the best in the community.
              </p>
              <button 
                className="premium-btn" 
                onClick={handleInit} 
                disabled={initLoading}
                style={{ width: 'auto', padding: '10px 24px' }}
              >
                {initLoading ? 'Initializing...' : '🚀 Start Current Week'}
              </button>
            </div>
          )}

          {/* ── NOMINATION PHASE ─────────── */}
          {phase === 'nomination' && week && (
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <h2 className="section-title">🚀 NOMINATIONS</h2>
                <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700 }}>WEEK {weekNumber}</span>
              </div>
              
              <div className="glass-card" style={{ padding: 16 }}>
                {topCars.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No nominations yet. Boost your car in the Garage!</div>
                  </div>
                ) : (
                  topCars.map((car, i) => (
                    <div key={car.id} className="leaderboard-item">
                      <div className={`rank-number ${i < 3 ? 'top-rank' : ''}`}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.5px' }}>{car.make} {car.model}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                          @{car.profiles?.username} · {car.profiles?.location}
                        </div>
                      </div>
                      {i < 8 && <Badge type="featured" size="sm" />}
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* ── BRACKET PHASES ─────────── */}
          {['round_of_8', 'semifinal', 'final'].includes(phase) && week && (
            <section style={{ marginBottom: 56 }}>
              <h2 className="section-title">🏁 {phase.toUpperCase().replace(/_/g, ' ')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {matchups.map(mu => {
                  const voted = userVotes[mu.id]
                  const total = mu.votes_a + mu.votes_b || 1
                  return (
                    <div key={mu.id} className="matchup-card">
                      <div className="matchup-sides">
                        <button
                          onClick={() => handleVote(mu, mu.car_a, true)}
                          disabled={!!voted}
                          className={`matchup-btn ${voted === mu.car_a?.id ? 'voted' : ''}`}
                        >
                          <div className="matchup-car-name">{mu.car_a?.make}</div>
                          <div className="matchup-car-model">{mu.car_a?.model}</div>
                          {voted && (
                            <div className="matchup-percent">
                              {Math.round(mu.votes_a / total * 100)}%
                            </div>
                          )}
                        </button>

                        <div className="matchup-vs">VS</div>

                        <button
                          onClick={() => handleVote(mu, mu.car_b, false)}
                          disabled={!!voted}
                          className={`matchup-btn ${voted === mu.car_b?.id ? 'voted' : ''}`}
                        >
                          <div className="matchup-car-name">{mu.car_b?.make}</div>
                          <div className="matchup-car-model">{mu.car_b?.model}</div>
                          {voted && (
                            <div className="matchup-percent">
                              {Math.round(mu.votes_b / total * 100)}%
                            </div>
                          )}
                        </button>
                      </div>
                      {!voted && <div className="matchup-tap-hint">Tap a car to cast your vote</div>}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── CITY LEADERBOARD ─────────── */}
          <section style={{ marginBottom: 56 }}>
            <h2 className="section-title">🏙️ CITY STANDINGS</h2>
            <div className="glass-card" style={{ padding: 12 }}>
              {cityBoard.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--muted)', fontSize: '13px' }}>
                  Cities are earning points...
                </div>
              ) : (
                cityBoard.map((c, i) => (
                  <div key={c.city} className="city-row">
                    <span style={{ width: 24, fontWeight: 700, color: i < 3 ? 'var(--gold)' : 'var(--muted)' }}>
                      {i + 1}
                    </span>
                    <span style={{ flex: 1, fontWeight: 600 }}>{c.city}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{c.points} PTS</span>
                    {i === 0 && <Badge type="rising" set="city" size="sm" />}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── HALL OF FAME ─────────── */}
          <section>
            <h2 className="section-title">🏛️ HALL OF FAME</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hofWinners.length === 0 ? (
                <div className="glass-card" style={{ padding: 24, textAlign: 'center', borderStyle: 'dashed' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '13px' }}>No legends crowned yet. Who will be first?</div>
                </div>
              ) : (
                hofWinners.map(w => (
                  <div key={w.id} className="hof-card">
                    <div className="hof-crown">🏆</div>
                    <div style={{ flex: 1 }}>
                      <div className="hof-car">{w.cars?.make} {w.cars?.model}</div>
                      <div className="hof-owner">@{w.profiles?.username} · {w.year}</div>
                    </div>
                    <Badge type="legend" size="sm" />
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>

      <style>{`
        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 1.5px;
          color: var(--text);
          margin-bottom: 12px;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: 16px;
        }
        .phase-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(240, 192, 64, 0.1);
          border: 1px solid rgba(240, 192, 64, 0.2);
          padding: 6px 14px;
          border-radius: 20px;
          color: var(--gold);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .phase-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 8px var(--gold);
        }
        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .leaderboard-item:last-child {
          border-bottom: none;
        }
        .rank-number {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: var(--muted);
          border-radius: 6px;
        }
        .top-rank {
          color: var(--gold);
          background: rgba(240, 192, 64, 0.1);
        }
        .matchup-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
        }
        .matchup-sides {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .matchup-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          padding: 16px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text);
          text-align: center;
        }
        .matchup-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--muted);
        }
        .matchup-btn.voted {
          background: rgba(240, 192, 64, 0.05);
          border-color: var(--gold);
        }
        .matchup-car-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .matchup-car-model {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
        }
        .matchup-percent {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          color: var(--gold);
          margin-top: 8px;
        }
        .matchup-vs {
          font-family: 'Bebas Neue';
          font-size: 18px;
          color: var(--muted);
          opacity: 0.5;
        }
        .matchup-tap-hint {
          text-align: center;
          font-size: 11px;
          color: var(--muted);
          margin-top: 14px;
          letter-spacing: 0.5px;
        }
        .city-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 4px;
          border-bottom: 1px solid var(--border);
        }
        .city-row:last-child {
          border-bottom: none;
        }
        .hof-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(90deg, rgba(240, 192, 64, 0.05), transparent);
          border: 1px solid var(--border);
          padding: 16px;
          border-radius: 16px;
        }
        .hof-crown {
          font-size: 24px;
        }
        .hof-car {
          font-weight: 700;
          font-size: 16px;
        }
        .hof-owner {
          font-size: 12px;
          color: var(--muted);
        }
        .premium-btn {
          background: var(--gold);
          color: #000;
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(240, 192, 64, 0.3);
        }
      `}</style>
    </div>
  )
}
