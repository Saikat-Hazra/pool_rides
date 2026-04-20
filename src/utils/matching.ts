import type { Pool, MatchQuery, RankedPool } from '@/types'

// Configurable weights — change these to tune ranking
export const MATCH_WEIGHTS = {
  originProximity: 40,
  destinationMatch: 30,
  timeWindowOverlap: 20,
  sameCampus: 10,
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function calcTimeOverlap(
  poolStart: string,
  poolEnd: string,
  queryStart: string,
  queryEnd: string,
): number {
  const ps = timeToMinutes(poolStart)
  const pe = timeToMinutes(poolEnd)
  const qs = timeToMinutes(queryStart)
  const qe = timeToMinutes(queryEnd)

  const overlapStart = Math.max(ps, qs)
  const overlapEnd = Math.min(pe, qe)
  const overlap = Math.max(0, overlapEnd - overlapStart)
  const queryWindow = qe - qs

  if (queryWindow <= 0) return 0
  return Math.min(1, overlap / queryWindow)
}

function normalizeArea(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function areasMatch(a: string, b: string): boolean {
  return normalizeArea(a) === normalizeArea(b)
}

// ─── Core Scoring ─────────────────────────────────────────────────────────────

export function scorePool(pool: Pool, query: MatchQuery): RankedPool['scoreBreakdown'] & { total: number } {
  const origin = areasMatch(pool.originLabel, query.originLabel) ? MATCH_WEIGHTS.originProximity : 0
  const destination = areasMatch(pool.destinationLabel, query.destinationLabel) ? MATCH_WEIGHTS.destinationMatch : 0
  const timeRatio = calcTimeOverlap(pool.timeWindowStart, pool.timeWindowEnd, query.timeWindowStart, query.timeWindowEnd)
  const timeWindow = Math.round(timeRatio * MATCH_WEIGHTS.timeWindowOverlap)
  const campus = query.collegeId && pool.collegeId === query.collegeId ? MATCH_WEIGHTS.sameCampus : 0

  return {
    origin,
    destination,
    timeWindow,
    campus,
    total: origin + destination + timeWindow + campus,
  }
}

// ─── Rank Pools ───────────────────────────────────────────────────────────────

export function rankPools(pools: Pool[], query: MatchQuery): RankedPool[] {
  const result: RankedPool[] = []

  for (const pool of pools) {
    // Hard filters
    if (pool.status === 'cancelled') continue
    if (query.womenOnly && !pool.womenOnly) continue
    if (query.verifiedOnly && !pool.verifiedOnly) continue
    if (pool.seatsFilled >= pool.seatsTotal && pool.status !== 'full') continue

    // Day filter — if pool has recurrenceDays, check overlap
    if (pool.recurrenceDays && query.days.length > 0) {
      const hasOverlap = query.days.some((d) => pool.recurrenceDays?.includes(d))
      if (!hasOverlap) continue
    }

    const { total, ...scoreBreakdown } = scorePool(pool, query)

    result.push({
      ...pool,
      matchScore: total,
      scoreBreakdown,
    })
  }

  // Sort: by score desc, then by seatsFilled asc (prefer pools with space)
  return result.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
    return a.seatsFilled - b.seatsFilled
  })
}
