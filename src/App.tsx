import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { initAuth, restoreSession } from '@/services/authService'
import { initPools } from '@/services/poolService'
import { initSavings } from '@/services/savingsService'
import { usePoolStore } from '@/store/poolStore'
import { getAllPools } from '@/services/poolService'

import Navbar from '@/components/Layout/Navbar'
import ToastContainer from '@/components/UI/ToastContainer'

import Landing from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Onboarding from '@/pages/auth/Onboarding'
import Dashboard from '@/pages/Dashboard'
import Discover from '@/pages/Discover'
import CreatePool from '@/pages/CreatePool'
import PoolDetails from '@/pages/PoolDetails'
import MyRides from '@/pages/MyRides'
import Savings from '@/pages/Savings'
import Profile from '@/pages/Profile'
import AdminPanel from '@/pages/admin/AdminPanel'

// ─── Route guards ─────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { role } = useAuthStore()
  if (role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// ─── App shell (authenticated layout) ────────────────────────────────────────

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-16">{children}</main>
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

function AppInit() {
  const { setUser, clearUser, setLoading } = useAuthStore()
  const { setPools } = usePoolStore()

  useEffect(() => {
    // Seed and restore session on load
    initAuth()
    initPools()
    initSavings()

    const restored = restoreSession()
    if (restored) {
      setUser(restored.user)
      setPools(getAllPools())
    } else {
      clearUser()
    }
    setLoading(false)
  }, [])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Routes>
        {/* Public */}
        <Route path="/" element={<RedirectIfAuth><Landing /></RedirectIfAuth>} />
        <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
        <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

        {/* Onboarding (auth required, no nav) */}
        <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />

        {/* App (auth + nav) */}
        <Route path="/dashboard" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />
        <Route path="/discover" element={<RequireAuth><AppLayout><Discover /></AppLayout></RequireAuth>} />
        <Route path="/create-pool" element={<RequireAuth><AppLayout><CreatePool /></AppLayout></RequireAuth>} />
        <Route path="/pool/:id" element={<RequireAuth><AppLayout><PoolDetails /></AppLayout></RequireAuth>} />
        <Route path="/my-rides" element={<RequireAuth><AppLayout><MyRides /></AppLayout></RequireAuth>} />
        <Route path="/savings" element={<RequireAuth><AppLayout><Savings /></AppLayout></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><AppLayout><Profile /></AppLayout></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAuth><RequireAdmin><AppLayout><AdminPanel /></AppLayout></RequireAdmin></RequireAuth>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
