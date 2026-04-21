import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { usePoolStore } from '@/store/poolStore'
import { getAllPools, getMembershipForUser } from '@/services/poolService'
import { StatusBadge } from '@/components/UI/Badges'
import EmptyState from '@/components/UI/EmptyState'
import { MapPin, Clock, Users, Car } from 'lucide-react'
import { COLLEGES } from '@/data/seed'


const TAB_OPTIONS = ['All', 'Active', 'Completed', 'Cancelled'] as const
type Tab = typeof TAB_OPTIONS[number]

export default function MyRides() {
  const { currentUser } = useAuthStore()
  const { pools, setPools } = usePoolStore()
  const [tab, setTab] = useState<Tab>('All')

  useEffect(() => {
    setPools(getAllPools())
  }, [])

  if (!currentUser) return null

  const memberships = getMembershipForUser(currentUser.id).filter((m) => m.joinStatus === 'accepted')
  const myPoolIds = new Set(memberships.map((m) => m.poolId))
  const myPools = pools.filter((p) => myPoolIds.has(p.id))

  const filtered = myPools.filter((p) => {
    if (tab === 'All') return true
    if (tab === 'Active') return p.status === 'open' || p.status === 'pending' || p.status === 'started'
    if (tab === 'Completed') return p.status === 'completed'
    if (tab === 'Cancelled') return p.status === 'cancelled'
    return true
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="page-title">My rides</h1>
        <p className="text-sm text-slate-400 mt-1">All pools you've created or joined.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900/50 border border-slate-800 p-1 rounded-lg w-fit">
        {TAB_OPTIONS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t ? 'bg-slate-800 text-white shadow-sm shadow-black' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No rides here"
          description={tab === 'All' ? "You haven't joined or created any pools yet." : `No ${tab.toLowerCase()} rides found.`}
          action={
            <div className="flex gap-3">
              <Link to="/discover" className="btn-secondary text-sm">Find a pool</Link>
              <Link to="/create-pool" className="btn-primary text-sm">Create a pool</Link>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((pool) => {
            const isCreator = pool.creatorId === currentUser.id
            const collegeName = COLLEGES.find((c) => c.id === pool.collegeId)?.name ?? '—'
            const splitAmount = Math.round(pool.estimatedTotalFare / Math.max(1, pool.seatsFilled))
            return (
              <Link key={pool.id} to={`/pool/${pool.id}`}>
                <div className="card-hover">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <StatusBadge status={pool.status} />
                        {isCreator && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/30 text-indigo-300 border border-indigo-800/50 font-medium">Creator</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{collegeName}</p>
                    </div>
                    <span className="text-sm font-bold text-teal-400">₹{splitAmount}/person</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex flex-col items-center gap-1 opacity-70">
                      <div className="w-2 h-2 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50" />
                      <div className="w-px h-5 bg-slate-800" />
                      <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{pool.originLabel}</p>
                      <p className="text-sm text-slate-500">{pool.destinationLabel}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pool.timeWindowStart} – {pool.timeWindowEnd}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{pool.seatsFilled}/{pool.seatsTotal} riders</span>
                    {pool.recurrenceDays && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Recurring</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
