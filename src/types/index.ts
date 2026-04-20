// ─── Core Enums ───────────────────────────────────────────────────────────────

export type VerifiedStatus = 'pending' | 'verified' | 'rejected' | 'suspended'
export type Role = 'student' | 'admin'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export type PoolStatus = 'open' | 'pending' | 'full' | 'started' | 'completed' | 'cancelled'
export type VisibilityType = 'public' | 'invite_only' | 'campus_only'
export type MemberRole = 'creator' | 'rider'
export type JoinStatus = 'pending' | 'accepted' | 'rejected' | 'left'
export type MessageType = 'text' | 'status_update' | 'system'
export type ReportStatus = 'open' | 'reviewed' | 'actioned' | 'dismissed'
export type CommuteMode = 'cab' | 'auto' | 'bike' | 'any'
export type RecurrenceType = 'daily' | 'weekdays' | 'custom'

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface LocationCoordinates {
  lat: number
  lng: number
}

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  phone?: string
  collegeId: string
  yearOfStudy?: number
  verifiedStatus: VerifiedStatus
  homeArea: string
  avatarUrl?: string
  gender?: Gender
  role: Role
  preferencesJson: {
    womenOnly?: boolean
    verifiedOnly?: boolean
    commuteMode?: CommuteMode
  }
  createdAt: string
  lastLoginAt?: string
}

export interface College {
  id: string
  name: string
  city: string
  emailDomain: string
  status: 'active' | 'pending'
}

export interface CommuteTemplate {
  id: string
  userId: string
  originLabel: string
  originCoords?: LocationCoordinates
  destinationLabel: string
  destCoords?: LocationCoordinates
  daysOfWeek: DayOfWeek[]
  departureWindowStart: string // "HH:MM"
  departureWindowEnd: string
  recurrenceType: RecurrenceType
}

export interface Pool {
  id: string
  creatorId: string
  collegeId: string
  originLabel: string
  originCoords?: LocationCoordinates
  destinationLabel: string
  destCoords?: LocationCoordinates
  pickupNotes?: string
  dropNotes?: string
  date: string
  recurrenceDays?: DayOfWeek[]
  timeWindowStart: string // "HH:MM"
  timeWindowEnd: string
  estimatedTotalFare: number
  seatsTotal: number
  seatsFilled: number
  visibilityType: VisibilityType
  womenOnly: boolean
  verifiedOnly: boolean
  status: PoolStatus
  createdAt: string
}

export interface PoolMember {
  id: string
  poolId: string
  userId: string
  role: MemberRole
  joinStatus: JoinStatus
  splitAmount: number
  joinedAt: string
}

export interface PoolMessage {
  id: string
  poolId: string
  userId: string
  messageType: MessageType
  body: string
  createdAt: string
}

export interface SavingsEntry {
  id: string
  userId: string
  poolId: string
  soloEstimatedCost: number
  pooledCost: number
  savingsAmount: number
  rideDate: string
}

export interface Report {
  id: string
  reporterUserId: string
  targetUserId?: string
  poolId?: string
  reason: string
  status: ReportStatus
  createdAt: string
}

// ─── Derived / View types ─────────────────────────────────────────────────────

export interface RankedPool extends Pool {
  matchScore: number
  scoreBreakdown: {
    origin: number
    destination: number
    timeWindow: number
    campus: number
  }
  creatorName?: string
  collegeName?: string
}

export interface MatchQuery {
  originLabel: string
  destinationLabel: string
  timeWindowStart: string
  timeWindowEnd: string
  days: DayOfWeek[]
  collegeId?: string
  womenOnly?: boolean
  verifiedOnly?: boolean
  verifiedUserIds?: string[]
}

export interface DiscoverFilters {
  area: string
  campus: string
  day: string
  timeStart: string
  timeEnd: string
  seatsMin: number
  womenOnly: boolean
  verifiedOnly: boolean
}

export interface AuthSession {
  userId: string
  role: Role
  token: string
  expiresAt: string
}

export interface ServiceError {
  code: string
  message: string
}
