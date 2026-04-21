import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePoolStore } from '@/store/poolStore'
import { getAllPools } from '@/services/poolService'
import { rankPools } from '@/utils/matching'
import PoolCard from '@/components/Pool/PoolCard'
import EmptyState from '@/components/UI/EmptyState'
import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react'
import type { RankedPool, DayOfWeek } from '@/types'
import { BENGALURU_AREAS, COLLEGES } from '@/data/seed'

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Discover() {
  const { currentUser } = useAuthStore()
  const { pools, setPools, filters, setFilters, resetFilters } = usePoolStore()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [ranked, setRanked] = useState<RankedPool[]>([])

  useEffect(() => {
    const all = getAllPools()
    setPools(all)
  }, [])

  useEffect(() => {
    if (!currentUser) return
    const query = {
      originLabel: filters.area || currentUser.homeArea || '',
      destinationLabel: filters.campus || '',
      timeWindowStart: filters.timeStart || '06:00',
      timeWindowEnd: filters.timeEnd || '23:00',
      days: filters.day ? [filters.day as DayOfWeek] : DAYS,
      collegeId: filters.campus ? COLLEGES.find((c) => c.name === filters.campus)?.id : currentUser.collegeId,
      womenOnly: filters.womenOnly || undefined,
      verifiedOnly: filters.verifiedOnly || undefined,
    }
    const filtered = pools.filter((p) => {
      if (filters.seatsMin > 1 && (p.seatsTotal - p.seatsFilled) < filters.seatsMin) return false
      return true
    })
    setRanked(rankPools(filtered, query))
  }, [pools, filters, currentUser])

  const hasActiveFilters =
    filters.area || filters.campus || filters.day || filters.timeStart || filters.womenOnly || filters.verifiedOnly

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Discover pools</h1>
          <p className="text-sm text-slate-400 mt-0.5">{ranked.length} pool{ranked.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary gap-2 relative ${showFilters ? 'border-teal-500/50 text-teal-400 bg-teal-900/30' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50" />}
          </button>
          <div className="flex rounded-lg border border-slate-800 overflow-hidden bg-slate-900/50">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 transition-colors ${view === 'grid' ? 'bg-teal-900/40 text-teal-400' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 transition-colors ${view === 'list' ? 'bg-teal-900/40 text-teal-400' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Filter pools</h3>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Origin area</label>
              <select className="input-field" value={filters.area} onChange={(e) => setFilters({ area: e.target.value })}>
                <option value="">Any area</option>
                {BENGALURU_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label">College</label>
              <select className="input-field" value={filters.campus} onChange={(e) => setFilters({ campus: e.target.value })}>
                <option value="">Any college</option>
                {COLLEGES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Day</label>
              <select className="input-field" value={filters.day} onChange={(e) => setFilters({ day: e.target.value })}>
                <option value="">Any day</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">From time</label>
              <input type="time" className="input-field" value={filters.timeStart} onChange={(e) => setFilters({ timeStart: e.target.value })} />
            </div>
            <div>
              <label className="label">Until time</label>
              <input type="time" className="input-field" value={filters.timeEnd} onChange={(e) => setFilters({ timeEnd: e.target.value })} />
            </div>
            <div>
              <label className="label">Min seats left</label>
              <select className="input-field" value={filters.seatsMin} onChange={(e) => setFilters({ seatsMin: Number(e.target.value) })}>
                {[1, 2, 3].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                className="rounded border-slate-800 bg-slate-900 text-teal-500 focus:ring-teal-500/20"
                checked={filters.womenOnly}
                onChange={(e) => setFilters({ womenOnly: e.target.checked })}
              />
              Women-only pools
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                className="rounded border-slate-800 bg-slate-900 text-teal-500 focus:ring-teal-500/20"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters({ verifiedOnly: e.target.checked })}
              />
              Verified-only pools
            </label>
          </div>
        </div>
      )}

      {/* Results */}
      {ranked.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No pools found"
          description="No pools match your current filters. Try widening your time window or area."
          action={
            <button onClick={resetFilters} className="btn-secondary text-sm">
              Clear filters
            </button>
          }
        />
      ) : (
        <div className={view === 'grid'
          ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-3'
        }>
          {ranked.map((pool) => (
            <PoolCard key={pool.id} pool={pool} showScore />
          ))}
        </div>
      )}
    </div>
  )
}
