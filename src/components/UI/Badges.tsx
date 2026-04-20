import React from 'react'
import type { PoolStatus } from '@/types'

const STATUS_CLASSES: Record<PoolStatus, string> = {
  open: 'badge-open',
  pending: 'badge-pending',
  full: 'badge-full',
  started: 'badge-pending',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

const STATUS_LABELS: Record<PoolStatus, string> = {
  open: 'Open',
  pending: 'Pending',
  full: 'Full',
  started: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface StatusBadgeProps {
  status: PoolStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={STATUS_CLASSES[status]}>{STATUS_LABELS[status]}</span>
}

interface VerifiedBadgeProps {
  verified: boolean
  className?: string
}

export function VerifiedBadge({ verified, className = '' }: VerifiedBadgeProps) {
  if (!verified) return null
  return (
    <span className={`badge-verified ${className}`}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  )
}

interface WomenOnlyBadgeProps {
  show: boolean
}

export function WomenOnlyBadge({ show }: WomenOnlyBadgeProps) {
  if (!show) return null
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200">
      Women Only
    </span>
  )
}
