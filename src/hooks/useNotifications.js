import { useState, useEffect, useRef } from 'react'  // add useRef
import { supabase } from '../services/supabase'
import { fetchNotifications, markAsRead, markAllNotificationsAsRead, deleteNotification } from '../services/api'

export function useNotifications(userId, onNewNotif) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // ✅ Keep callback ref always up-to-date without triggering re-renders
  const onNewNotifRef = useRef(onNewNotif)
  useEffect(() => {
    onNewNotifRef.current = onNewNotif
  }, [onNewNotif])

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ useNotifications: No userId. Sync idle.")
      return
    }

    console.log("🏎️ useNotifications: Booting sync for", userId.slice(0, 8))

    fetchNotifications(userId).then(data => {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
      setLoading(false)
    })

    const channelName = `notifs-${userId.slice(0, 8)}`
    console.log(`🔌 [${channelName}] Attempting connection...`)

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: userId }
      }
    })
    
    channel.on(
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

            // ✅ Always calls the latest version of the callback
            if (onNewNotifRef.current) onNewNotifRef.current(enriched)
          } catch (e) {
            console.error("Enrich error:", e)
          }
        }
      )

    let lastStatus = null
    channel.subscribe((status, err) => {
      if (err) console.error(`❌ [${channelName}] Error:`, err)
      if (status !== lastStatus) {
        console.log(`📡 [${channelName}] Status:`, status)
        lastStatus = status
      }
      if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
        console.warn(`⚠️ [${channelName}] Connection issue (${status}). Retrying...`)
        setTimeout(() => {
          if (channel) channel.subscribe()
        }, 3000)
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
    if (!userId || unreadCount === 0) return
    
    // 1. Optimistic Update
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))

    // 2. Persistent Update
    try {
      await markAllNotificationsAsRead(userId)
    } catch (err) {
      console.error("Mark all read error:", err)
    }
  }

  const handleDelete = async (id) => {
    // 1. Optimistic Update
    const toDelete = notifications.find(n => n.id === id)
    if (!toDelete) return

    if (!toDelete.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setNotifications(prev => prev.filter(n => n.id !== id))

    // 2. Persistent Update
    try {
      await deleteNotification(id)
    } catch (err) {
      console.error("Delete notification error:", err)
    }
  }

  return { notifications, unreadCount, loading, handleMarkRead, markAllAsRead, handleDelete }
}
