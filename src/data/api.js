// ─────────────────────────────────────────
// RevUp — Supabase API Layer
// ─────────────────────────────────────────
import { supabase } from '../supabase'

// ── Posts ───────────────────────────────────
export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchPostsByUser(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createPost(postData) {
  const { error } = await supabase.from('posts').insert(postData)
  if (error) throw error
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw error
}

// ── Notifications ───────────────────────────
export async function createNotification({ user_id, actor_id, type, entity_id }) {
  // Commented out to allow testing with same account in multiple tabs
  // if (user_id === actor_id) return

  const { error } = await supabase.from('notifications').insert({
    user_id,
    actor_id,
    type,
    entity_id
  })
  if (error) console.error("Notification trigger error:", error.message)
}

export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, profiles!actor_id(username, full_name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(15)

  if (error) throw error
  return data || []
}

export async function markAsRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  if (error) throw error
}

// ── Likes ───────────────────────────────────
export async function fetchLikes(postId) {
  const { data } = await supabase
    .from('likes')
    .select('user_id')
    .eq('post_id', postId)
  return data || []
}

export async function addLike(postId, userId) {
  // 1. Add the like
  await supabase.from('likes').insert({ post_id: postId, user_id: userId })

  // 2. Trigger notification for post owner
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()
  if (post && post.user_id !== userId) {
    await createNotification({
      user_id: post.user_id,
      actor_id: userId,
      type: 'like',
      entity_id: postId
    })
  }
}

export async function removeLike(postId, userId) {
  await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId)
}

// ── Comments ────────────────────────────────
export async function fetchCommentCount(postId) {
  const { count } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)
  return count || 0
}

export async function fetchComments(postId) {
  const { data: commentData } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (!commentData) return []

  const userIds = [...new Set(commentData.map(c => c.user_id))]
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, full_name, username')
    .in('id', userIds)

  const profileMap = Object.fromEntries((profileData || []).map(p => [p.id, p]))
  return commentData.map(c => ({
    ...c,
    profiles: profileMap[c.user_id] || null,
  }))
}

export async function addComment(postId, userId, content) {
  // 1. Add comment
  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: userId,
    content,
  })
  if (error) throw error

  // 2. Trigger notification for post owner
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()
  if (post && post.user_id !== userId) {
    await createNotification({
      user_id: post.user_id,
      actor_id: userId,
      type: 'comment',
      entity_id: postId
    })
  }
}

export async function deleteComment(commentId) {
  await supabase.from('comments').delete().eq('id', commentId)
}

// ── Profiles ────────────────────────────────
export async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('username, full_name, location, cover_url')
    .eq('id', userId)
    .maybeSingle()
  return data
}

export async function updateProfile(userId, updateData) {
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
  if (error) throw error
}

// ── Follows ─────────────────────────────────
export async function followUser(followerId, followingId) {
  // 1. Add Follow
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId })
  if (error) throw error

  // 2. Trigger notification
  await createNotification({
    user_id: followingId,
    actor_id: followerId,
    type: 'follow',
    entity_id: followerId
  })
}

export async function unfollowUser(followerId, followingId) {
  const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId)
  if (error) throw error
}

export async function fetchFollowCounts(userId) {
  const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId)
  const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
  return { followers: followers || 0, following: following || 0 }
}

export async function checkFollowing(followerId, followingId) {
  const { data } = await supabase.from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).maybeSingle()
  return !!data
}

export async function fetchAllProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('username', { ascending: true })
  if (error) throw error
  return data || []
}

export async function fetchFollowing(followerId) {
  const { data, error } = await supabase.from('follows').select('following_id').eq('follower_id', followerId)
  if (error) throw error
  return data.map(f => f.following_id) || []
}

export async function fetchFollowersProfiles(userId) {
  // 1. Get the list of IDs who follow target user
  const { data: followRows, error: followErr } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', userId)

  if (followErr) {
    console.error("Followers ID fetch error:", followErr.message)
    return []
  }

  if (!followRows || followRows.length === 0) return []

  const followerIds = followRows.map(r => r.follower_id)

  // 2. Fetch profiles for those IDs
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, username, full_name, location')
    .in('id', followerIds)

  if (profErr) {
    console.error("Followers profile fetch error:", profErr.message)
    return []
  }

  return profiles || []
}

export async function fetchFollowingProfiles(userId) {
  // 1. Get the list of IDs current user is following
  const { data: followRows, error: followErr } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  if (followErr) {
    console.error("Following ID fetch error:", followErr.message)
    return []
  }

  if (!followRows || followRows.length === 0) return []

  const followingIds = followRows.map(r => r.following_id)

  // 2. Fetch profiles for those IDs
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, username, full_name, location')
    .in('id', followingIds)

  if (profErr) {
    console.error("Following profile fetch error:", profErr.message)
    return []
  }

  return profiles || []
}

// ── Cars ────────────────────────────────────
export async function fetchCars(userId) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function addCar(carData) {
  const { error } = await supabase.from('cars').insert(carData)
  if (error) throw error
}

export async function deleteCar(carId) {
  const { error } = await supabase.from('cars').delete().eq('id', carId)
  if (error) throw error
}

// ── Events ──────────────────────────────────
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function fetchEventAttendees(eventId) {
  const { data } = await supabase
    .from('event_attendees')
    .select('user_id')
    .eq('event_id', eventId)
  return data || []
}

export async function attendEvent(eventId, userId) {
  // 1. Attend
  const { error } = await supabase.from('event_attendees').insert({ event_id: eventId, user_id: userId })
  if (error) throw error

  // 2. Trigger notification for event owner
  const { data: event } = await supabase.from('events').select('creator_id').eq('id', eventId).single()
  if (event && event.creator_id !== userId) {
    await createNotification({
      user_id: event.creator_id,
      actor_id: userId,
      type: 'event_join',
      entity_id: eventId
    })
  }
}

export async function leaveEvent(eventId, userId) {
  const { error } = await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', userId)
  if (error) throw error
}

export async function injectDummyEvents(userId) {
  const dummyEvents = [
    { creator_id: userId, name: 'Supercar Sunday — BIC Track Day', month: 'APR', day: '5', location: 'Buddh International Circuit, Greater Noida', type: 'Track Day', tag: 'tag-gold', hot: true, description: 'India\'s biggest supercar track day. Open to all cars above 300HP.' },
    { creator_id: userId, name: 'JDM Legends Meetup', month: 'APR', day: '12', location: 'UB City, Bangalore', type: 'Meetup', tag: 'tag-blue', hot: false, description: 'Monthly JDM meet for Skylines, Supras, RX-7s and all Japanese legends. Free entry.' },
    { creator_id: userId, name: 'Auto Expo 2026', month: 'APR', day: '19', location: 'Bharat Mandapam, New Delhi', type: 'Expo', tag: 'tag-red', hot: true, description: 'India\'s largest auto show. New car launches, concept reveals.' },
    { creator_id: userId, name: 'Bangalore Night Drive', month: 'APR', day: '26', location: 'Cubbon Park, Bangalore', type: 'Drive', tag: 'tag-purple', hot: false, description: 'Saturday night convoy drive through Bangalore\'s best roads.' }
  ]
  const { error } = await supabase.from('events').insert(dummyEvents)
  if (error) {
    console.error("Injection error:", error)
    throw error
  }
}

