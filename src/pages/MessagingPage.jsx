import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchConversations, getOrCreateConversation } from '../data/api'
import { useChat } from '../hooks/useChat'

export default function MessagingPage() {
  const { session } = useAuth()
  const { chatId } = useParams()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const [conversations, setConversations] = useState([])
  const [convLoading, setConvLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')

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

  // 2. Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    try {
      await sendMessage(newMessage)
      setNewMessage('')
    } catch (err) {
      alert("Failed to send message")
    }
  }

  const getOtherUser = (conv) => {
    return conv.user_1 === userId ? conv.user_2_profile : conv.user_1_profile
  }

  return (
    <div className="app-layout" style={{ height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <div className="messaging-container">
        
        {/* Sidebar: Conversations */}
        <div className="inbox-sidebar">
          <div className="inbox-header">
            <h3>DRIVERS BOX</h3>
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
              <p>Your inbox is ready for the next heat. Pickup a conversation or start a new one from a driver's profile.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
