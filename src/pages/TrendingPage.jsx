import { TRENDING } from '../data/constants'

export default function TrendingPage() {
  return (
    <div className="feed-col" style={{ maxWidth: '520px', margin: '0 auto' }}>
      <div className="feed-bar"><div><span className="feed-heading">Trending</span><span className="feed-sub">Right now 🔥</span></div></div>
      <div style={{ padding: '8px 16px' }}>
        {TRENDING.map((t, i) => (
          <div key={i} className="trend-item" style={{ padding: '14px 0' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>#{i + 1} · {t.sub}</div>
              <div className="trend-tag" style={{ fontSize: '15px' }}>{t.tag}</div>
              <div className="trend-count" style={{ marginTop: '3px' }}>{t.count}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
