import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { fetchMessages, sendMessage as apiSendMessage } from '../data/api'

export function useChat(conversationId, userId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) return
    let isMounted = true

    // 1. Initial Load
    async function loadInitialMessages() {
      setLoading(true)
      try {
        const data = await fetchMessages(conversationId)
        if (isMounted) setMessages(data)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadInitialMessages()

    // 2. Real-time Subscription
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Add new message if not already present (prevents duplicates from local echoes)
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  const sendMessage = async (content) => {
    if (!content.trim() || !userId || !conversationId) return
    
    try {
      // We send to API, and the realtime listener will pick it up
      // Or we can optimistically add it here
      await apiSendMessage({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim()
      })
    } catch (err) {
      console.error("Failed to send message:", err)
      throw err
    }
  }

  return { messages, loading, sendMessage }
}
