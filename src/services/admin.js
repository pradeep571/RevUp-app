// src/services/admin.js — admin-only functions

import { supabase } from './supabase'

// Call this every Monday to open a new nomination week
export async function openNominationWeek(weekNumber, year, startDate, endDate) {
  const { error } = await supabase.from('competition_weeks').insert({
    week_number: weekNumber, year,
    phase: 'nomination',
    start_date: startDate,
    end_date: endDate
  })
  if (error) throw error
}

// Call Wednesday to move to Round of 8 and generate matchups
export async function advanceToRoundOf8(weekId, topCarIds) {
  // Shuffle and pair the top 8 cars
  const shuffled = [...topCarIds].sort(() => Math.random() - 0.5)
  const matchups = []
  for (let i = 0; i < 8; i += 2) {
    matchups.push({ week_id: weekId, round: 'round_of_8', car_a_id: shuffled[i], car_b_id: shuffled[i + 1], votes_a: 0, votes_b: 0 })
  }
  await supabase.from('matchups').insert(matchups)
  await supabase.from('competition_weeks').update({ phase: 'round_of_8' }).eq('id', weekId)
}

// Call Thursday to advance winners to semifinal
export async function advanceToSemifinal(weekId) {
  const { data: matchups } = await supabase.from('matchups').select('*').eq('week_id', weekId).eq('round', 'round_of_8')
  if (!matchups) return

  const winners = matchups.map(m => m.votes_a >= m.votes_b ? m.car_a_id : m.car_b_id)

  // Update winner on each matchup
  await Promise.all(matchups.map(m =>
    supabase.from('matchups').update({ winner_car_id: m.votes_a >= m.votes_b ? m.car_a_id : m.car_b_id }).eq('id', m.id)
  ))

  // Create semifinal matchups
  const semifinalMatchups = [
    { week_id: weekId, round: 'semifinal', car_a_id: winners[0], car_b_id: winners[1], votes_a: 0, votes_b: 0 },
    { week_id: weekId, round: 'semifinal', car_a_id: winners[2], car_b_id: winners[3], votes_a: 0, votes_b: 0 }
  ]
  await supabase.from('matchups').insert(semifinalMatchups)
  await supabase.from('competition_weeks').update({ phase: 'semifinal' }).eq('id', weekId)
}

// Call Friday to advance to final
export async function advanceToFinal(weekId) {
  const { data: matchups } = await supabase.from('matchups').select('*').eq('week_id', weekId).eq('round', 'semifinal')
  if (!matchups) return

  const winners = matchups.map(m => m.votes_a >= m.votes_b ? m.car_a_id : m.car_b_id)

  await Promise.all(matchups.map(m =>
    supabase.from('matchups').update({ winner_car_id: m.votes_a >= m.votes_b ? m.car_a_id : m.car_b_id }).eq('id', m.id)
  ))

  await supabase.from('matchups').insert({
    week_id: weekId, round: 'final', car_a_id: winners[0], car_b_id: winners[1], votes_a: 0, votes_b: 0
  })
  await supabase.from('competition_weeks').update({ phase: 'final' }).eq('id', weekId)
}

// Call Sunday to crown the winner and award badge
export async function crownWeeklyWinner(weekId, weekNumber, year) {
  const { data: finalMatchup } = await supabase
    .from('matchups').select('*, car_a:cars!car_a_id(user_id), car_b:cars!car_b_id(user_id)')
    .eq('week_id', weekId).eq('round', 'final').single()

  if (!finalMatchup) return

  const winnerCarId = finalMatchup.votes_a >= finalMatchup.votes_b ? finalMatchup.car_a_id : finalMatchup.car_b_id
  const winnerUserId = finalMatchup.votes_a >= finalMatchup.votes_b ? finalMatchup.car_a.user_id : finalMatchup.car_b.user_id

  await supabase.from('matchups').update({ winner_car_id: winnerCarId }).eq('id', finalMatchup.id)
  await supabase.from('competition_weeks').update({ phase: 'completed' }).eq('id', weekId)

  // Record winner
  await supabase.from('competition_winners').insert({
    car_id: winnerCarId, user_id: winnerUserId,
    win_type: 'weekly', week_number: weekNumber, year
  })

  // Award badge
  await checkAndUpgradeBadge(winnerUserId, winnerCarId)

  return winnerCarId
}

async function checkAndUpgradeBadge(userId, carId) {
  const { count: monthlyWins } = await supabase
    .from('competition_winners')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('win_type', 'monthly')

  let badge_type = 'featured'
  if (monthlyWins >= 1) badge_type = 'respected'
  if (monthlyWins >= 3) badge_type = 'elite'

  // Safe upsert alternative (delete older badge if exists, insert new one)
  await supabase.from('badges').delete().eq('user_id', userId).eq('car_id', carId)
  
  const { error } = await supabase.from('badges').insert({ user_id: userId, car_id: carId, badge_type })
  if (error) console.error("Could not award badge:", error.message)
}
