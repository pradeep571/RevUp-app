export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#08080a',
    }}>
      <div style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: '36px',
        color: '#f0c040',
        letterSpacing: '3px',
      }}>
        REV<span style={{ color: '#ff4d2e' }}>UP</span>
      </div>
    </div>
  )
}
