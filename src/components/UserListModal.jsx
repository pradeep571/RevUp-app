import { useNavigate } from 'react-router-dom'

export default function UserListModal({ title, users, onClose }) {
  const navigate = useNavigate()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="user-list" style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px 0' }}>
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              No racers found in this crew. 🏎️
            </div>
          ) : (
            users.map(user => (
              <div 
                key={user.id} 
                className="user-list-item" 
                onClick={() => {
                  navigate(`/profile/${user.id}`)
                  onClose()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.2s'
                }}
              >
                <div className="post-avatar" style={{ background: 'linear-gradient(135deg, var(--gold), var(--red))', width: '40px', height: '40px', color: '#000', flexShrink: 0 }}>
                  {(user.full_name || user.username || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.full_name || user.username}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    @{user.username}
                  </div>
                </div>

                <div style={{ color: 'var(--gold)', fontSize: '18px' }}>›</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
