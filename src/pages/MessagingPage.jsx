import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchAllProfiles, fetchConversations, getOrCreateConversation, markConversationAsRead } from '../services/api'
import { useChat } from '../hooks/useChat'
import { supabase } from '../services/supabase'

export default function MessagingPage() {
  const { session } = useAuth()
  const { chatId } = useParams()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const [conversations, setConversations] = useState([])
  const [convLoading, setConvLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')

  // New chat modal state
  const [showNewChat, setShowNewChat] = useState(false)
  const [profileQuery, setProfileQuery] = useState('')
  const [profiles, setProfiles] = useState([])
  const [profilesLoading, setProfilesLoading] = useState(false)

  const userId = session?.user?.id
  const { messages, loading: chatLoading, sendMessage } = useChat(chatId, userId)

  // 1. Load conversations
  useEffect(() => {
    if (!userId) return
    fetchConversations(userId).then(data => {
      setConversations(data)
      setConvLoading(false)
    })
  }, [userId, chatId])

  // Mark conversation as read when opening a thread
  useEffect(() => {
    if (!userId || !chatId) return
    markConversationAsRead(chatId)
      .then(() => {
        setConversations(prev =>
          prev.map(c => (c.id === chatId ? { ...c, is_read: true } : c))
        )
      })
      .catch(() => {
        // Keep UI as-is; realtime will eventually reconcile.
      })
  }, [chatId, userId])

  // Realtime updates for conversations unread status (cross-tab)
  useEffect(() => {
    if (!userId) return

    let debounceTimer = null
    const scheduleReload = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        fetchConversations(userId).then(data => setConversations(data || []))
      }, 250)
    }

    const channelName = `conversations-${userId.slice(0, 8)}`
    let lastStatus = null
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        scheduleReload
      )
      .subscribe((status, err) => {
        if (err) console.error(`[${channelName}] realtime error`, err)
        if (status !== lastStatus) {
          console.log(`[${channelName}] realtime status`, status)
          lastStatus = status
        }
        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setTimeout(() => { channel.subscribe() }, 1500)
        }
      })

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [userId])

  // 2. Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load profiles for the "New message" picker
  useEffect(() => {
    if (!showNewChat || !userId) return

    let isMounted = true

    async function loadProfiles() {
      try {
        setProfilesLoading(true)
        const data = await fetchAllProfiles()
        if (!isMounted) return
        setProfiles(data || [])
      } catch {
        // Keep UI simple; errors can be surfaced via a toast later.
      } finally {
        if (isMounted) setProfilesLoading(false)
      }
    }

    loadProfiles()

    return () => { isMounted = false }
  }, [showNewChat, userId])

  const filteredProfiles = profiles.filter(p => {
    const q = profileQuery.trim().toLowerCase()
    if (!q) return true
    const name = (p.full_name || '').toLowerCase()
    const username = (p.username || '').toLowerCase()
    return name.includes(q) || username.includes(q)
  })

  const startChatWith = async (targetUserId) => {
    if (!userId || !targetUserId || targetUserId === userId) return
    try {
      const cid = await getOrCreateConversation(userId, targetUserId)
      setShowNewChat(false)
      setProfileQuery('')
      navigate(`/messages/${cid}`)
    } catch {
      alert('Failed to start conversation')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    try {
      await sendMessage(newMessage)
      setNewMessage('')
    } catch {
      alert('Failed to send message')
    }
  }

  const getOtherUser = (conv) => {
    return conv.user_1 === userId ? conv.user_2_profile : conv.user_1_profile
  }

  return (
    <div className="app-layout messaging-layout">
      <div className="messaging-container">

        {/* Sidebar: Conversations */}
        <div className="inbox-sidebar">
          <div className="inbox-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <h3 style={{ margin: 0 }}>DRIVERS BOX</h3>
              <button
                className="event-join-btn"
                style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 11 }}
                onClick={() => setShowNewChat(true)}
              >
                + New
              </button>
            </div>
          </div>
          <div className="conv-list">
            {convLoading ? (
              <div className="conv-loading">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="conv-empty">No conversations yet.</div>
            ) : (
              conversations.map(c => {
                const other = getOtherUser(c)
                const isActive = chatId === c.id
                return (
                  <div
                    key={c.id}
                    className={`conv-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(`/messages/${c.id}`)}
                  >
                    <div className="conv-avatar">
                      {other?.full_name?.[0].toUpperCase() || 'R'}
                    </div>
                    <div className="conv-info">
                      <div className="conv-name">{other?.full_name || 'Anonymous Racer'}</div>
                      <div className="conv-last">{c.last_message || 'Start the engine...'}</div>
                    </div>
                    {!c.is_read && c.last_sender !== userId && <div className="conv-dot"></div>}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Main: Chat Thread */}
        <div className="chat-thread-container">
          {chatId ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-user-name">
                    {conversations.find(c => c.id === chatId)
                      ? getOtherUser(conversations.find(c => c.id === chatId))?.full_name
                      : 'Chatting with Driver'}
                  </div>
                  <div className="chat-user-status">Online now</div>
                </div>
              </div>

              <div className="chat-messages">
                {chatLoading ? (
                  <div className="chat-loading">Tuning history...</div>
                ) : messages.length === 0 ? (
                  <div className="chat-placeholder">
                    <div className="chat-placeholder-icon">🏁</div>
                    <h2>Start your Race Talk</h2>
                    <p>Coordinate meets, discuss modifications, or just talk shop.</p>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isMe = m.sender_id === userId
                    return (
                      <div key={m.id || i} className={`msg-row ${isMe ? 'me' : 'them'}`}>
                        <div className="msg-bubble">
                          {m.content}
                          <div className="msg-time">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={scrollRef} style={{ padding: '10px' }} />
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                  placeholder="Draft your race talk..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()}>➤</button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder">
              <div className="chat-placeholder-icon">💬</div>
              <h2>SELECT A DRIVER</h2>
              <p>Your inbox is ready for the next heat. Pick a conversation or start a new one from a driver's profile.</p>
              <button
                className="event-join-btn"
                style={{ marginTop: 18, padding: '10px 18px' }}
                onClick={() => setShowNewChat(true)}
              >
                + Start New Message
              </button>
            </div>
          )}
        </div>

      </div>

      {/* New Message Modal */}
      {showNewChat && (
        <div className="modal-backdrop" onClick={() => setShowNewChat(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420 }}
          >
            <div className="form-header">
              <div className="form-title">New Message</div>
              <button className="modal-close-btn" onClick={() => setShowNewChat(false)}>✕</button>
            </div>

            <div style={{ padding: 16 }}>
              <input
                value={profileQuery}
                onChange={(e) => setProfileQuery(e.target.value)}
                placeholder="Search drivers..."
                style={{
                  width: '100%',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  color: 'var(--text)',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  boxSizing: 'border-box'
                }}
              />

              <div style={{ marginTop: 12, maxHeight: 360, overflowY: 'auto' }}>
                {profilesLoading ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
                    Loading racers...
                  </div>
                ) : filteredProfiles.filter(p => p.id !== userId).length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
                    No racers found.
                  </div>
                ) : (
                  filteredProfiles
                    .filter(p => p.id !== userId)
                    .map(p => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border)'
                        }}
                        onClick={() => startChatWith(p.id)}
                      >
                        <div
                          className="post-avatar"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            background: 'linear-gradient(135deg, var(--gold), var(--red))',
                            color: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {(p.full_name || p.username || '?')[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.full_name || 'Unknown Driver'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            @{p.username || 'racer'}
                          </div>
                        </div>
                        <div style={{ color: 'var(--gold)', fontSize: 18 }}>›</div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
