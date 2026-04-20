import { describe, it, expect } from 'vitest'
import { scorePool, rankPools, MATCH_WEIGHTS } from '../src/utils/matching'
import type { Pool, MatchQuery } from '../src/types'

const basePool: Pool = {
  id: 'test_pool',
  creatorId: 'u1',
  collegeId: 'col_rvce',
  originLabel: 'Marathahalli',
  destinationLabel: 'RVCE',
  date: 'recurring',
  recurrenceDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  timeWindowStart: '08:00',
  timeWindowEnd: '08:30',
  estimatedTotalFare: 400,
  seatsTotal: 4,
  seatsFilled: 1,
  visibilityType: 'public',
  womenOnly: false,
  verifiedOnly: false,
  status: 'open',
  createdAt: new Date().toISOString(),
}

const baseQuery: MatchQuery = {
  originLabel: 'Marathahalli',
  destinationLabel: 'RVCE',
  timeWindowStart: '08:00',
  timeWindowEnd: '08:30',
  days: ['Mon'],
  collegeId: 'col_rvce',
}

describe('scorePool', () => {
  it('scores 100 for a perfect match', () => {
    const result = scorePool(basePool, baseQuery)
    expect(result.total).toBe(100)
    expect(result.origin).toBe(MATCH_WEIGHTS.originProximity) // 40
    expect(result.destination).toBe(MATCH_WEIGHTS.destinationMatch) // 30
    expect(result.timeWindow).toBe(MATCH_WEIGHTS.timeWindowOverlap) // 20
    expect(result.campus).toBe(MATCH_WEIGHTS.sameCampus) // 10
  })

  it('scores 0 for origin when areas differ', () => {
    const result = scorePool(basePool, { ...baseQuery, originLabel: 'Whitefield' })
    expect(result.origin).toBe(0)
  })

  it('scores 0 for destination when destinations differ', () => {
    const result = scorePool(basePool, { ...baseQuery, destinationLabel: 'PES University' })
    expect(result.destination).toBe(0)
  })

  it('scores max time when time windows fully overlap', () => {
    const result = scorePool(basePool, { ...baseQuery, timeWindowStart: '08:00', timeWindowEnd: '08:30' })
    expect(result.timeWindow).toBe(MATCH_WEIGHTS.timeWindowOverlap)
  })

  it('scores 0 for time when there is no overlap', () => {
    const result = scorePool(basePool, { ...baseQuery, timeWindowStart: '10:00', timeWindowEnd: '11:00' })
    expect(result.timeWindow).toBe(0)
  })

  it('scores partial time when overlap is partial', () => {
    // Pool: 08:00–08:30 (30 min), Query: 08:15–08:45 (30 min), overlap: 08:15–08:30 = 15 min
    const result = scorePool(basePool, { ...baseQuery, timeWindowStart: '08:15', timeWindowEnd: '08:45' })
    expect(result.timeWindow).toBe(Math.round(0.5 * MATCH_WEIGHTS.timeWindowOverlap))
  })

  it('adds campus bonus when same college', () => {
    const result = scorePool(basePool, { ...baseQuery, collegeId: 'col_rvce' })
    expect(result.campus).toBe(MATCH_WEIGHTS.sameCampus)
  })

  it('gives no campus bonus when different college', () => {
    const result = scorePool(basePool, { ...baseQuery, collegeId: 'col_pes' })
    expect(result.campus).toBe(0)
  })
})

describe('rankPools', () => {
  it('returns pools in descending score order', () => {
    const lowPool: Pool = {
      ...basePool,
      id: 'low',
      originLabel: 'Whitefield',
      destinationLabel: 'PES University',
      collegeId: 'col_pes',
    }
    const result = rankPools([lowPool, basePool], baseQuery)
    expect(result[0].id).toBe('test_pool')
    expect(result[0].matchScore).toBeGreaterThan(result[1]?.matchScore ?? -1)
  })

  it('excludes cancelled pools', () => {
    const cancelled = { ...basePool, id: 'cancelled', status: 'cancelled' as const }
    const result = rankPools([cancelled, basePool], baseQuery)
    expect(result.every((p) => p.id !== 'cancelled')).toBe(true)
  })

  it('excludes non-women-only pools when womenOnly is queried', () => {
    const notWomen = { ...basePool, id: 'nw', womenOnly: false }
    const result = rankPools([notWomen], { ...baseQuery, womenOnly: true })
    expect(result.length).toBe(0)
  })

  it('excludes pools with no day overlap', () => {
    const weekendPool: Pool = { ...basePool, id: 'weekend', recurrenceDays: ['Sat', 'Sun'] }
    const result = rankPools([weekendPool], { ...baseQuery, days: ['Mon'] })
    expect(result.length).toBe(0)
  })
})
