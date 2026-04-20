import { describe, it, expect } from 'vitest'
import { calcSplit, calcSavings, calcWeeklySavings, calcMonthlySavings, calcTotalSavings } from '../src/utils/costCalc'
import type { SavingsEntry } from '../src/types'

function makeEntry(userId: string, savingsAmount: number, daysAgo: number): SavingsEntry {
  return {
    id: `e_${Math.random()}`,
    userId,
    poolId: 'p1',
    soloEstimatedCost: 300 + savingsAmount,
    pooledCost: 300,
    savingsAmount,
    rideDate: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  }
}

describe('calcSplit', () => {
  it('divides fare equally among riders', () => {
    expect(calcSplit(300, 3)).toBe(100)
  })

  it('returns full fare for 1 rider', () => {
    expect(calcSplit(300, 1)).toBe(300)
  })

  it('rounds non-integer splits', () => {
    expect(calcSplit(100, 3)).toBe(33)
  })

  it('returns full fare when count is 0', () => {
    expect(calcSplit(300, 0)).toBe(300)
  })
})

describe('calcSavings', () => {
  it('returns the difference between solo and pooled cost', () => {
    expect(calcSavings(200, 100)).toBe(100)
  })

  it('returns 0 when pooled cost exceeds solo cost', () => {
    expect(calcSavings(100, 200)).toBe(0)
  })

  it('returns 0 when costs are equal', () => {
    expect(calcSavings(150, 150)).toBe(0)
  })
})

describe('calcWeeklySavings', () => {
  it('sums savings within last 7 days', () => {
    const entries = [
      makeEntry('u1', 100, 1),
      makeEntry('u1', 200, 3),
      makeEntry('u1', 300, 8), // older than 7 days — should be excluded
    ]
    expect(calcWeeklySavings(entries, 'u1')).toBe(300)
  })

  it('returns 0 for an empty array', () => {
    expect(calcWeeklySavings([], 'u1')).toBe(0)
  })

  it('filters by userId when provided', () => {
    const entries = [
      makeEntry('u1', 100, 1),
      makeEntry('u2', 500, 1),
    ]
    expect(calcWeeklySavings(entries, 'u1')).toBe(100)
  })
})

describe('calcTotalSavings', () => {
  it('sums all savings regardless of date', () => {
    const entries = [
      makeEntry('u1', 100, 1),
      makeEntry('u1', 200, 40),
      makeEntry('u1', 300, 200),
    ]
    expect(calcTotalSavings(entries, 'u1')).toBe(600)
  })

  it('returns 0 for empty array', () => {
    expect(calcTotalSavings([], 'u1')).toBe(0)
  })
})
