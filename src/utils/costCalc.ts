import type { SavingsEntry } from '@/types'

export function calcSplit(estimatedTotalFare: number, confirmedRiderCount: number): number {
  if (confirmedRiderCount <= 0) return estimatedTotalFare
  return Math.round(estimatedTotalFare / confirmedRiderCount)
}

export function calcSavings(soloEstimatedCost: number, pooledCost: number): number {
  return Math.max(0, soloEstimatedCost - pooledCost)
}

export function calcWeeklySavings(entries: SavingsEntry[], userId?: string): number {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return entries
    .filter((e) => {
      if (userId && e.userId !== userId) return false
      return new Date(e.rideDate) >= sevenDaysAgo
    })
    .reduce((sum, e) => sum + e.savingsAmount, 0)
}

export function calcMonthlySavings(entries: SavingsEntry[], userId?: string): number {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  return entries
    .filter((e) => {
      if (userId && e.userId !== userId) return false
      return new Date(e.rideDate) >= thirtyDaysAgo
    })
    .reduce((sum, e) => sum + e.savingsAmount, 0)
}

export function calcTotalSavings(entries: SavingsEntry[], userId?: string): number {
  return entries
    .filter((e) => (userId ? e.userId === userId : true))
    .reduce((sum, e) => sum + e.savingsAmount, 0)
}

export function groupByWeek(entries: SavingsEntry[], userId?: string): { week: string; savings: number }[] {
  const filtered = entries.filter((e) => (userId ? e.userId === userId : true))
  const groups: Record<string, number> = {}

  for (const entry of filtered) {
    const date = new Date(entry.rideDate)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toISOString().split('T')[0]
    groups[key] = (groups[key] ?? 0) + entry.savingsAmount
  }

  return Object.entries(groups)
    .map(([week, savings]) => ({ week, savings }))
    .sort((a, b) => a.week.localeCompare(b.week))
}
