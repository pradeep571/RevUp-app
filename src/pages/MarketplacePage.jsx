import { useState } from 'react'
import { INITIAL_LISTINGS, MARKET_FILTERS, SORT_OPTIONS } from '../data/constants'
import ListingCard from '../components/ListingCard'
import ListingDetail from '../components/ListingDetail'
import SellForm from '../components/SellForm'

export default function MarketplacePage() {
  const [listings, setListings] = useState(INITIAL_LISTINGS)
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('Newest')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showSell, setShowSell] = useState(false)

  const filtered = listings.filter(l => {
    const matchFilter = filter === 'All' ? true : filter === 'Under ₹1Cr' ? !['₹1.2 Cr', '₹2.8 Cr', '₹3.5 Cr', '₹2.9 Cr'].includes(l.price) : filter === 'Bangalore' ? l.location === 'Bangalore' : l.category === filter
    const matchSearch = search === '' || l.name.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="feed-col" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="feed-bar">
        <div><span className="feed-heading">Marketplace</span><span className="feed-sub">{listings.length} listings</span></div>
        <button className="create-event-btn" onClick={() => setShowSell(true)}>+ Sell Car</button>
      </div>
      <div className="market-search">
        <span className="market-search-icon">🔍</span>
        <input placeholder="Search make, model, city..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <span style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: '14px' }} onClick={() => setSearch('')}>✕</span>}
      </div>
      <div className="chips" style={{ paddingTop: '4px' }}>
        {MARKET_FILTERS.map(f => <button key={f} className={filter === f ? 'chip active' : 'chip'} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="market-bar">
        {SORT_OPTIONS.map(s => <button key={s} className={sort === s ? 'market-sort active' : 'market-sort'} onClick={() => setSort(s)}>{s}</button>)}
        <span className="market-count">{filtered.length} results</span>
      </div>
      {filtered.length === 0
        ? <div className="events-empty">No listings found 🚗</div>
        : <div className="market-grid">{filtered.map(l => <ListingCard key={l.id} listing={l} onSelect={setSelected} />)}</div>
      }
      {selected && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}
      {showSell && <SellForm onClose={() => setShowSell(false)} onList={l => setListings([l, ...listings])} />}
    </div>
  )
}
