import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchShorts, injectDummyShorts } from '../data/api'
import ShortItem from '../components/ShortItem'
import ShortUpload from '../components/ShortUpload'

export default function ShortsPage() {
  const { session } = useAuth()
  const [shorts, setShorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  async function loadShorts() {
    if (!session?.user?.id) return
    try {
      let data = await fetchShorts()
      
      if (data.length === 0) {
        // Auto inject dummy shorts if DB is totally empty
        await injectDummyShorts(session.user.id)
        data = await fetchShorts()
      }
      
      setShorts(data)
    } catch (err) {
      console.error("Failed to load shorts", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShorts()
  }, [session?.user?.id])

  if (loading) return <div className="feed-col" style={{ alignItems: 'center', paddingTop: '40px' }}>Loading Shorts... 📹</div>

  return (
    <div className="shorts-page-wrapper">
      {/* Absolute Add Button that floats on top of the fullscreen videos */}
      <button 
        className="create-event-btn" 
        style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 100 }}
        onClick={() => setShowUpload(true)}
      >
        + Add Short
      </button>

      {/* The Snap Scrolling Container */}
      <div className="shorts-scroll-container">
        {shorts.map(short => (
          <ShortItem key={short.id} short={short} />
        ))}
      </div>

      {showUpload && (
        <ShortUpload 
          onClose={() => setShowUpload(false)} 
          onUploaded={loadShorts} 
        />
      )}
    </div>
  )
}
