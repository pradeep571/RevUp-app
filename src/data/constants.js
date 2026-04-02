// ─────────────────────────────────────────
// RevUp — Static Data Constants
// ─────────────────────────────────────────

export const STORIES = [
  { id: 1, name: 'SpeedKing', emoji: '🏎️' },
  { id: 2, name: 'NitroSam', emoji: '🔥' },
  { id: 3, name: 'EVLover', emoji: '⚡' },
  { id: 4, name: 'DriftKing', emoji: '🚗' },
  { id: 5, name: 'TrackRat', emoji: '🏁' },
  { id: 6, name: 'ClassicJoe', emoji: '🚙' },
]

export const CHIPS = ['For You', 'Following', 'JDM', 'Supercars', 'Modified', 'Track Days', 'Electric', 'Bangalore']

export const TRENDING = [
  { tag: '#SupercarSunday', count: '18.4K posts', sub: 'Motorsport' },
  { tag: '#BangaloreCarMeet', count: '9.2K posts', sub: 'Bangalore' },
  { tag: '#R34GTR', count: '7.8K posts', sub: 'JDM' },
  { tag: '#EVRevolution', count: '5.1K posts', sub: 'Electric' },
  { tag: '#StanceCulture', count: '4.4K posts', sub: 'Modified' },
  { tag: '#TrackDayIndia', count: '3.1K posts', sub: 'Motorsport' },
]

export const SUGGESTED = [
  { id: 1, name: 'NitroSam', sub: '12.4K followers', bg: 'linear-gradient(135deg,#ff4d2e,#c0392b)', color: '#fff' },
  { id: 2, name: 'DriftKing', sub: '8.9K followers', bg: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff' },
  { id: 3, name: 'GarageGuru', sub: '6.2K followers', bg: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' },
]

export const EVENTS = [
  { id: 1, month: 'APR', day: '5', name: 'Supercar Sunday — BIC Track Day', location: 'Buddh International Circuit, Greater Noida', type: 'Track Day', tag: 'tag-gold', going: 247, hot: true, desc: 'India\'s biggest supercar track day. Open to all cars above 300HP. Timing runs, parade laps and pit access included.' },
  { id: 2, month: 'APR', day: '12', name: 'JDM Legends Meetup — Bangalore', location: 'UB City Parking, Vittal Mallya Rd, Bangalore', type: 'Meetup', tag: 'tag-blue', going: 89, hot: false, desc: 'Monthly JDM meet for Skylines, Supras, RX-7s and all Japanese legends. Free entry.' },
  { id: 3, month: 'APR', day: '19', name: 'Auto Expo 2026 — Delhi', location: 'Bharat Mandapam, New Delhi', type: 'Expo', tag: 'tag-red', going: 1200, hot: true, desc: 'India\'s largest auto show. New car launches, concept reveals, EV showcases and celebrity appearances.' },
  { id: 4, month: 'APR', day: '26', name: 'Bangalore Night Drive', location: 'Meets at Cubbon Park, Bangalore', type: 'Drive', tag: 'tag-purple', going: 134, hot: false, desc: 'Saturday night convoy drive through Bangalore\'s best roads. 80km round trip.' },
  { id: 5, month: 'MAY', day: '3', name: 'EV Drive Day — Mumbai', location: 'Bandra Kurla Complex, Mumbai', type: 'Electric', tag: 'tag-green', going: 312, hot: false, desc: 'Test drives, charging demos and talks from EV owners. Free registration.' },
  { id: 6, month: 'MAY', day: '10', name: 'Modified Car Show — Bangalore', location: 'NICE Road, Electronic City, Bangalore', type: 'Show', tag: 'tag-gold', going: 420, hot: true, desc: 'South India\'s biggest modified car show. Cash prizes for winners.' },
]

export const EVENT_FILTERS = ['All', 'Bangalore', 'Track Day', 'Meetup', 'Expo', 'Electric', 'Show', 'Drive']

export const INITIAL_CARS = [
  { id: 1, emoji: '🏎️', imgBg: 'linear-gradient(160deg,#1a0d0a,#2e1500,#120a08)', make: 'Ferrari', model: '488 GTB', year: '2019', hp: '660', kmph: '330', sprint: '3.0s', engine: '3.9L Twin-Turbo V8', mods: ['Akrapovic Exhaust', 'Carbon Splitter', 'Race Suspension'], tag: 'tag-red', tagLabel: 'Supercar', posts: 24, status: 'Active' },
  { id: 2, emoji: '🚗', imgBg: 'linear-gradient(160deg,#0d1117,#141a24,#0d1117)', make: 'BMW', model: 'M3 Competition', year: '2022', hp: '510', kmph: '290', sprint: '3.9s', engine: '3.0L Twin-Turbo I6', mods: ['M Performance Exhaust', 'Lowering Springs', 'Carbon Mirrors'], tag: 'tag-blue', tagLabel: 'Sports', posts: 18, status: 'Active' },
  { id: 3, emoji: '⚡', imgBg: 'linear-gradient(160deg,#040d12,#0d2030,#040d12)', make: 'Tesla', model: 'Model S Plaid', year: '2023', hp: '1020', kmph: '322', sprint: '2.1s', engine: 'Tri-Motor Electric', mods: ['Custom Wrap', 'Performance Wheels', 'Tinted Windows'], tag: 'tag-green', tagLabel: 'Electric', posts: 12, status: 'Active' },
]

export const INITIAL_LISTINGS = [
  { id: 1, emoji: '🏎️', imgBg: 'linear-gradient(160deg,#1a0d0a,#2e1500)', name: 'Ferrari 458 Italia', spec: '2015 · 42,000 km · Rosso Corsa', price: '₹2.8 Cr', location: 'Mumbai', views: '1.2K', verified: true, hp: '570', kmph: '325', sprint: '3.4s', engine: '4.5L V8', features: ['Original Paint', 'Full Service History', 'Ceramic Coating', 'Pirelli P Zero'], seller: { name: 'RohanM', sub: 'Verified Seller · 4 listings', bg: 'linear-gradient(135deg,#f0c040,#e8a020)', color: '#000' }, desc: 'One owner, always garaged, full Ferrari service history from authorized dealer.', category: 'Supercar' },
  { id: 2, emoji: '🚗', imgBg: 'linear-gradient(160deg,#0d1117,#141a24)', name: 'BMW M4 Competition', spec: '2021 · 18,000 km · Alpine White', price: '₹85 L', location: 'Delhi', views: '876', verified: true, hp: '510', kmph: '290', sprint: '3.9s', engine: '3.0L S58', features: ['M Carbon Seats', 'Harman Kardon', 'Adaptive M Suspension', 'Track Package'], seller: { name: 'PriyaK', sub: 'Verified Seller · 2 listings', bg: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff' }, desc: 'Pristine M4, carbon fibre roof, full M options package.', category: 'Sports' },
  { id: 3, emoji: '⚡', imgBg: 'linear-gradient(160deg,#040d12,#0d2030)', name: 'Porsche Taycan Turbo', spec: '2022 · 12,000 km · Gentian Blue', price: '₹1.2 Cr', location: 'Bangalore', views: '654', verified: true, hp: '680', kmph: '260', sprint: '3.2s', engine: 'Dual Motor Electric', features: ['Performance Battery Plus', 'Sport Chrono', 'Air Suspension', 'Panoramic Roof'], seller: { name: 'SureshV', sub: 'Verified Seller · 1 listing', bg: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }, desc: 'Loaded Taycan Turbo, fully electric with 500km+ range.', category: 'Electric' },
  { id: 4, emoji: '🚙', imgBg: 'linear-gradient(160deg,#17100d,#241a14)', name: 'Nissan GT-R R35', spec: '2017 · 35,000 km · Pearl White', price: '₹1.05 Cr', location: 'Pune', views: '2.1K', verified: false, hp: '565', kmph: '315', sprint: '2.9s', engine: '3.8L Twin-Turbo V6', features: ['Launch Control', 'Bose Audio', 'Nismo Upgrades', 'Carbon Brakes'], seller: { name: 'AmitJ', sub: 'Private Seller · 1 listing', bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: '#fff' }, desc: 'Godzilla in stunning Pearl White. Stage 1 tune, dyno proven 620whp.', category: 'JDM' },
  { id: 5, emoji: '🏎️', imgBg: 'linear-gradient(160deg,#1a0510,#2e0a20)', name: 'Lamborghini Huracán EVO', spec: '2020 · 8,000 km · Viola Pasifae', price: '₹3.5 Cr', location: 'Bangalore', views: '3.4K', verified: true, hp: '640', kmph: '325', sprint: '2.9s', engine: '5.2L V10 NA', features: ['LDVI System', 'MagneRide', 'Lifting System', 'Sensonum Audio'], seller: { name: 'KaranB', sub: 'Verified Seller · 6 listings', bg: 'linear-gradient(135deg,#f0c040,#ff4d2e)', color: '#000' }, desc: 'One of only 3 in this rare purple in India.', category: 'Supercar' },
  { id: 6, emoji: '🚗', imgBg: 'linear-gradient(160deg,#0a1200,#142400)', name: 'Porsche 911 GT3 RS', spec: '2023 · 2,000 km · Guards Red', price: '₹2.9 Cr', location: 'Chennai', views: '1.8K', verified: true, hp: '525', kmph: '296', sprint: '3.2s', engine: '4.0L Flat-6 NA', features: ['Weissach Package', 'PDK', 'Carbon Roof', 'Sport Exhaust'], seller: { name: 'VijayS', sub: 'Verified Seller · 3 listings', bg: 'linear-gradient(135deg,#ff4d2e,#c0392b)', color: '#fff' }, desc: 'Virtually new GT3 RS, barely driven. Full Porsche warranty remaining.', category: 'Sports' },
]

export const MARKET_FILTERS = ['All', 'Supercar', 'Sports', 'JDM', 'Electric', 'Under ₹1Cr', 'Bangalore']

export const SORT_OPTIONS = ['Newest', 'Price: Low', 'Price: High', 'Most Viewed']
