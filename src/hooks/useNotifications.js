import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { fetchNotifications, markAsRead } from '../data/api'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ useNotifications: No userId. Sync idle.")
      return
    }

    console.log("🏎️ useNotifications: Booting sync for", userId.slice(0, 8))

    // 1. Load data
    fetchNotifications(userId).then(data => {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
      setLoading(false)
    })

    // 2. Realtime
    const channelName = `notifs-${userId.slice(0, 8)}`
    console.log(`🔌 [${channelName}] Attempting connection...`)

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: userId }
      }
    })
    
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log("🔥 NEW LIVE NOTIF:", payload.new)
          try {
            const { data: actor } = await supabase
              .from('profiles')
              .select('username, full_name')
              .eq('id', payload.new.actor_id)
              .single()

            const enriched = { ...payload.new, profiles: actor }
            setNotifications(prev => [enriched, ...prev].slice(0, 20))
            setUnreadCount(prev => prev + 1)
          } catch (e) {
            console.error("Enrich error:", e)
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.error(`❌ [${channelName}] Error:`, err)
        console.log(`📡 [${channelName}] Status:`, status)
        
        if (status === 'TIMED_OUT') {
          console.warn("⚠️ Sync Timed Out. Retrying in 3s...")
          setTimeout(() => channel.subscribe(), 3000)
        }
      })

    return () => {
      console.log(`🔌 [${channelName}] Cleaning up...`)
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
