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

export async function createPost(postData) {
  const { error } = await supabase.from('posts').insert(postData)
  if (error) throw error
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
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
  await supabase.from('likes').insert({ post_id: postId, user_id: userId })
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
  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: userId,
    content,
  })
  if (error) throw error
}

export async function deleteComment(commentId) {
  await supabase.from('comments').delete().eq('id', commentId)
}

// ── Profiles ────────────────────────────────
export async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('username, full_name, location')
    .eq('id', userId)
    .maybeSingle()
  return data
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
