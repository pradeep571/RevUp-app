import {  BrowserRouter , Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import AuthPage from './pages/AuthPage'
import FeedPage from './pages/FeedPage'
import GaragePage from './pages/GaragePage'
import MarketplacePage from './pages/MarketplacePage'
import EventsPage from './pages/EventsPage'
import TrendingPage from './pages/TrendingPage'

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!session) return <AuthPage />

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/garage" element={<GaragePage />} />
        <Route path="/market" element={<MarketplacePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
