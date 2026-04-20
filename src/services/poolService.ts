import { getItem, setItem, KEYS } from './storageService'
import { SEED_POOLS, SEED_MEMBERS } from '@/data/seed'
import type { Pool, PoolMember, PoolMessage, Report } from '@/types'

export function initPools(): void {
  const existing = getItem<Pool>(KEYS.pools)
  if (existing.length === 0) {
    setItem(KEYS.pools, SEED_POOLS)
  }
  const existingMembers = getItem<PoolMember>(KEYS.members)
  if (existingMembers.length === 0) {
    setItem(KEYS.members, SEED_MEMBERS)
  }
}

// ─── Pool CRUD ────────────────────────────────────────────────────────────────

export function getAllPools(): Pool[] {
  return getItem<Pool>(KEYS.pools)
}

export function getPoolById(id: string): Pool | null {
  return getAllPools().find((p) => p.id === id) ?? null
}

export function createPool(pool: Omit<Pool, 'id' | 'createdAt' | 'seatsFilled' | 'status'>): Pool {
  const pools = getAllPools()
  const newPool: Pool = {
    ...pool,
    id: `pool_${Date.now()}`,
    seatsFilled: 1, // creator counts as 1
    status: 'open',
    createdAt: new Date().toISOString(),
  }
  setItem(KEYS.pools, [...pools, newPool])

  // Auto-add creator as member
  addMember({
    poolId: newPool.id,
    userId: pool.creatorId,
    role: 'creator',
    joinStatus: 'accepted',
    splitAmount: pool.estimatedTotalFare,
  })

  return newPool
}

export function updatePool(updated: Pool): void {
  const pools = getAllPools()
  setItem(KEYS.pools, pools.map((p) => (p.id === updated.id ? updated : p)))
}

export function updatePoolStatus(poolId: string, status: Pool['status']): void {
  const pools = getAllPools()
  setItem(KEYS.pools, pools.map((p) => (p.id === poolId ? { ...p, status } : p)))
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function getMembersForPool(poolId: string): PoolMember[] {
  return getItem<PoolMember>(KEYS.members).filter((m) => m.poolId === poolId)
}

export function getMembershipForUser(userId: string): PoolMember[] {
  return getItem<PoolMember>(KEYS.members).filter((m) => m.userId === userId)
}

export function addMember(data: Omit<PoolMember, 'id' | 'joinedAt'>): PoolMember {
  const members = getItem<PoolMember>(KEYS.members)
  const newMember: PoolMember = {
    ...data,
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    joinedAt: new Date().toISOString(),
  }
  setItem(KEYS.members, [...members, newMember])
  return newMember
}

export function updateMember(updated: PoolMember): void {
  const members = getItem<PoolMember>(KEYS.members)
  setItem(KEYS.members, members.map((m) => (m.id === updated.id ? updated : m)))

  // Recalculate seat count and split
  refreshPoolSeats(updated.poolId)
}

export function requestJoin(poolId: string, userId: string): PoolMember {
  const pool = getPoolById(poolId)
  if (!pool) throw new Error('Pool not found.')
  if (pool.status === 'full') throw new Error('This pool is full.')
  if (pool.seatsFilled >= pool.seatsTotal) throw new Error('This pool is full.')

  const existing = getItem<PoolMember>(KEYS.members).find(
    (m) => m.poolId === poolId && m.userId === userId,
  )
  if (existing) throw new Error('You have already requested to join this pool.')

  return addMember({ poolId, userId, role: 'rider', joinStatus: 'pending', splitAmount: 0 })
}

export function respondToJoin(memberId: string, accept: boolean): void {
  const members = getItem<PoolMember>(KEYS.members)
  const member = members.find((m) => m.id === memberId)
  if (!member) return

  const updated: PoolMember = { ...member, joinStatus: accept ? 'accepted' : 'rejected' }
  setItem(KEYS.members, members.map((m) => (m.id === memberId ? updated : m)))

  refreshPoolSeats(member.poolId)
}

function refreshPoolSeats(poolId: string): void {
  const members = getItem<PoolMember>(KEYS.members)
  const pool = getPoolById(poolId)
  if (!pool) return

  const accepted = members.filter((m) => m.poolId === poolId && m.joinStatus === 'accepted')
  const seatsFilled = accepted.length
  const splitAmount = seatsFilled > 0 ? Math.round(pool.estimatedTotalFare / seatsFilled) : pool.estimatedTotalFare

  // Update split amounts
  const updatedMembers = members.map((m) => {
    if (m.poolId === poolId && m.joinStatus === 'accepted') {
      return { ...m, splitAmount }
    }
    return m
  })
  setItem(KEYS.members, updatedMembers)

  const newStatus: Pool['status'] = seatsFilled >= pool.seatsTotal ? 'full' : pool.status === 'full' ? 'open' : pool.status
  const pools = getAllPools()
  setItem(KEYS.pools, pools.map((p) => (p.id === poolId ? { ...p, seatsFilled, status: newStatus } : p)))
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function getMessages(poolId: string): PoolMessage[] {
  return getItem<PoolMessage>(KEYS.messages).filter((m) => m.poolId === poolId)
}

export function postMessage(poolId: string, userId: string, body: string, type: PoolMessage['messageType'] = 'text'): PoolMessage {
  const msgs = getItem<PoolMessage>(KEYS.messages)
  const msg: PoolMessage = {
    id: `msg_${Date.now()}`,
    poolId,
    userId,
    messageType: type,
    body,
    createdAt: new Date().toISOString(),
  }
  setItem(KEYS.messages, [...msgs, msg])
  return msg
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export function getAllReports(): Report[] {
  return getItem<Report>(KEYS.reports)
}

export function submitReport(data: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
  const reports = getItem<Report>(KEYS.reports)
  const report: Report = {
    ...data,
    id: `rep_${Date.now()}`,
    status: 'open',
    createdAt: new Date().toISOString(),
  }
  setItem(KEYS.reports, [...reports, report])
  return report
}

export function updateReportStatus(reportId: string, status: Report['status']): void {
  const reports = getItem<Report>(KEYS.reports)
  setItem(KEYS.reports, reports.map((r) => (r.id === reportId ? { ...r, status } : r)))
}
