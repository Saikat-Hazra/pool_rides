import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { usePoolStore } from '@/store/poolStore'
import { getAllPools, getMembershipForUser, getMembersForPool } from '@/services/poolService'
import { getSavingsForUser } from '@/services/savingsService'
import { calcWeeklySavings, calcTotalSavings } from '@/utils/costCalc'
import { rankPools } from '@/utils/matching'
import PoolCard from '@/components/Pool/PoolCard'
import { StatusBadge } from '@/components/UI/Badges'
import {
  Plus,
  Search,
  TrendingUp,
  Clock,
  Car,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { COLLEGES } from '@/data/seed'
import type { Pool, DayOfWeek } from '@/types'

export default function Dashboard() {
  const { currentUser } = useAuthStore()
  const { pools, setPools } = usePoolStore()

  useEffect(() => {
    const all = getAllPools()
    setPools(all)
  }, [])

  if (!currentUser) return null

  const memberships = getMembershipForUser(currentUser.id)
  const myPoolIds = memberships.map((m) => m.poolId)
  const myPools = pools.filter((p) => myPoolIds.includes(p.id))
  const activePools = myPools.filter((p) => p.status === 'open' || p.status === 'pending')

  const savings = getSavingsForUser(currentUser.id)
  const weekly = calcWeeklySavings(savings, currentUser.id)
  const total = calcTotalSavings(savings, currentUser.id)

  // Suggested pools — ranked for this user
  const today = new Date().toLocaleString('en-US', { weekday: 'short' }) as DayOfWeek
  const suggested = rankPools(
    pools.filter((p) => !myPoolIds.includes(p.id) && p.status === 'open'),
    {
      originLabel: currentUser.homeArea,
      destinationLabel: '',
      timeWindowStart: '07:00',
      timeWindowEnd: '10:00',
      days: [today],
      collegeId: currentUser.collegeId,
    },
  ).slice(0, 3)

  // Pending join requests (creator side)
  const pendingRequests = (() => {
    try {
      const createdPools = pools.filter((p) => p.creatorId === currentUser.id)
      let count = 0
      for (const p of createdPools) {
        const members = getMembersForPool(p.id)
        count += members.filter((m: any) => m.joinStatus === 'pending').length
      }
      return count
    } catch {
      return 0
    }
  })()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">
          Good {getGreeting()}, {currentUser.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's your commute overview for today.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Weekly savings" value={`₹${weekly}`} sub="last 7 days" color="teal" icon={TrendingUp} />
        <StatCard label="Total saved" value={`₹${total}`} sub="all time" color="green" icon={Car} />
        <StatCard label="Active pools" value={String(activePools.length)} sub="joined or created" color="blue" icon={Clock} />
        <StatCard label="Pending requests" value={String(pendingRequests)} sub="awaiting your review" color={pendingRequests > 0 ? 'amber' : 'gray'} icon={AlertCircle} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: My Pools */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active pools */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">My active pools</h2>
              <Link to="/my-rides" className="text-sm text-teal-600 hover:underline font-medium">
                View all
              </Link>
            </div>
            {activePools.length === 0 ? (
              <div className="card flex flex-col items-center py-10 text-center">
                <Car className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">No active pools yet</p>
                <p className="text-xs text-gray-400 mb-4">Create a pool or join one to get started.</p>
                <div className="flex gap-2">
                  <Link to="/create-pool" className="btn-primary text-sm py-1.5">
                    <Plus className="w-3.5 h-3.5" /> Create pool
                  </Link>
                  <Link to="/discover" className="btn-secondary text-sm py-1.5">
                    <Search className="w-3.5 h-3.5" /> Discover
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activePools.slice(0, 3).map((pool) => (
                  <ActivePoolRow key={pool.id} pool={pool} />
                ))}
              </div>
            )}
          </section>

          {/* Suggested pools */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Suggested for you</h2>
              <Link to="/discover" className="text-sm text-teal-600 hover:underline font-medium">
                See all
              </Link>
            </div>
            {suggested.length === 0 ? (
              <div className="card py-8 text-center">
                <p className="text-sm text-gray-500">No suggestions right now. <Link to="/discover" className="text-teal-600 hover:underline">Search manually →</Link></p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {suggested.map((p) => (
                  <PoolCard key={p.id} pool={p} showScore />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Quick actions */}
        <div className="flex flex-col gap-4">
          <section className="card">
            <h2 className="section-title mb-4">Quick actions</h2>
            <div className="flex flex-col gap-2">
              <Link to="/create-pool" className="btn-primary w-full justify-center">
                <Plus className="w-4 h-4" /> Create a pool
              </Link>
              <Link to="/discover" className="btn-secondary w-full justify-center">
                <Search className="w-4 h-4" /> Find a pool
              </Link>
            </div>
          </section>

          {/* Verification status */}
          <div className={`card p-4 ${currentUser.verifiedStatus === 'verified' ? 'border-teal-200 bg-teal-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              {currentUser.verifiedStatus === 'verified'
                ? <CheckCircle className="w-4 h-4 text-teal-600" />
                : <AlertCircle className="w-4 h-4 text-amber-600" />}
              <span className={`text-sm font-semibold ${currentUser.verifiedStatus === 'verified' ? 'text-teal-800' : 'text-amber-800'}`}>
                {currentUser.verifiedStatus === 'verified' ? 'Verified student' : 'Pending verification'}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {currentUser.verifiedStatus === 'verified'
                ? 'Your campus email is verified. You can join any pool.'
                : 'Verification is pending admin review. You can still browse pools.'}
            </p>
          </div>

          {/* Savings summary mini */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Savings this week</h3>
            <div className="text-3xl font-bold text-teal-700 mb-1">₹{weekly}</div>
            <p className="text-xs text-gray-500">
              {savings.length} completed ride{savings.length !== 1 ? 's' : ''} tracked
            </p>
            <Link to="/savings" className="text-xs text-teal-600 hover:underline font-medium mt-2 inline-block">
              View full savings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

interface StatCardProps {
  label: string
  value: string
  sub: string
  color: 'teal' | 'green' | 'blue' | 'amber' | 'gray'
  icon: React.ComponentType<{ className?: string }>
}

const colorMap = {
  teal: 'bg-teal-50 text-teal-600',
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  gray: 'bg-gray-50 text-gray-400',
}

function StatCard({ label, value, sub, color, icon: Icon }: StatCardProps) {
  return (
    <div className="card p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs font-medium text-gray-700 mt-0.5">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  )
}

function ActivePoolRow({ pool }: { pool: Pool }) {
  const collegeName = COLLEGES.find((c) => c.id === pool.collegeId)?.name ?? '—'
  return (
    <Link to={`/pool/${pool.id}`} className="card-hover flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-teal-500" />
        <div className="w-px h-5 bg-gray-200" />
        <div className="w-2 h-2 rounded-full bg-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-gray-900 truncate">{pool.originLabel} → {pool.destinationLabel}</span>
        </div>
        <div className="text-xs text-gray-500">{pool.timeWindowStart} · {collegeName}</div>
      </div>
      <StatusBadge status={pool.status} />
    </Link>
  )
}
