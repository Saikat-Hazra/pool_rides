import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { logout } from '@/services/authService'
import {
  Home,
  Search,
  Plus,
  MapPin,
  TrendingUp,
  User,
  Shield,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/discover', label: 'Discover', icon: Search },
  { to: '/create-pool', label: 'Create Pool', icon: Plus },
  { to: '/my-rides', label: 'My Rides', icon: MapPin },
  { to: '/savings', label: 'Savings', icon: TrendingUp },
]

export default function Navbar() {
  const { currentUser, clearUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    clearUser()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to={currentUser?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 font-bold text-white text-lg">
            <img src="/Pool-rides_logo.png" alt="PoolRides" className="w-8 h-8 object-contain" />
            PoolRides
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {currentUser?.role !== 'admin' && NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-teal-900/40 text-teal-400'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {currentUser?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin') ? 'bg-teal-900/40 text-teal-400' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-900 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <User className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <span className="font-medium text-slate-200 max-w-[80px] truncate">
                {currentUser?.name?.split(' ')[0]}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="hidden sm:flex p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {currentUser?.role !== 'admin' && NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(to) ? 'bg-teal-900/40 text-teal-400' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {currentUser?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
          <div className="border-t border-slate-800 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
