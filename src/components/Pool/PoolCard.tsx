import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Users, IndianRupee, ArrowRight } from 'lucide-react'
import { StatusBadge, VerifiedBadge, WomenOnlyBadge } from '@/components/UI/Badges'
import type { RankedPool } from '@/types'
import { COLLEGES } from '@/data/seed'

interface PoolCardProps {
  pool: RankedPool
  soloFare?: number
  showScore?: boolean
}

export default function PoolCard({ pool, soloFare = 350, showScore = false }: PoolCardProps) {
  const seatsLeft = pool.seatsTotal - pool.seatsFilled
  const costPerPerson = Math.round(pool.estimatedTotalFare / Math.max(1, pool.seatsFilled + 1))
  const savings = soloFare - costPerPerson
  const collegeName = COLLEGES.find((c) => c.id === pool.collegeId)?.name ?? '—'

  return (
    <Link to={`/pool/${pool.id}`} className="block">
      <div className="card-hover group">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <StatusBadge status={pool.status} />
              <VerifiedBadge verified={pool.verifiedOnly} />
              <WomenOnlyBadge show={pool.womenOnly} />
              {showScore && pool.matchScore > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {pool.matchScore}% match
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{collegeName}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors mt-1 flex-shrink-0" />
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <div className="w-px h-6 bg-gray-200" />
            <div className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-900">{pool.originLabel}</span>
            <span className="text-sm text-gray-600">{pool.destinationLabel}</span>
          </div>
        </div>

        {/* Details row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {pool.timeWindowStart} – {pool.timeWindowEnd}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left
          </span>
          <span className="flex items-center gap-1 text-teal-700 font-medium">
            <IndianRupee className="w-3.5 h-3.5" />
            {costPerPerson}/person
          </span>
          {savings > 0 && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              Save ₹{savings}
            </span>
          )}
        </div>

        {/* Recurrence */}
        {pool.recurrenceDays && (
          <div className="mt-3 flex gap-1 flex-wrap">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span
                key={d}
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  pool.recurrenceDays?.includes(d as any)
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
