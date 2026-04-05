import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { fetchNotifications, markAsRead } from '../data/api'

export function useNotifications(userId) {
  console.log("🛠️ useNotifications Hook Initializing. userId:", userId)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ useNotifications: No userId provided. Sync paused.")
      return
    }

    // 1. Initial Fetch
    async function loadInitial() {
      try {
        const data = await fetchNotifications(userId)
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      } catch (err) {
        console.error("Initial notifications error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadInitial()

    // 2. Realtime Subscription
    console.log("🔔 Setting up Realtime for user:", userId)
    
    const channel = supabase
      .channel(`notifs:${userId.slice(0, 8)}`) // Shorter, unique channel name
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log("🔥 LIVE NOTIFICATION RECEIVED:", payload)
          
          try {
            const { data: actorProfile } = await supabase
              .from('profiles')
              .select('username, full_name')
              .eq('id', payload.new.actor_id)
              .single()

            const newNotif = {
              ...payload.new,
              profiles: actorProfile
            }

            setNotifications(prev => [newNotif, ...prev].slice(0, 20))
            setUnreadCount(prev => prev + 1)
          } catch (err) {
            console.error("Error enrichment live notif:", err)
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Notification Sync Status for ${userId.slice(0,8)}:`, status)
      })

    return () => {
      console.log("🔌 Disconnecting Notif Sync")
      supabase.removeChannel(channel)
    }
  }, [userId])

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Mark read error:", err)
    }
  }

  const markAllAsRead = async () => {
    // For simplicity, we can just update local state or call a bulk API if we add one
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  return { notifications, unreadCount, loading, handleMarkRead, markAllAsRead }
}
