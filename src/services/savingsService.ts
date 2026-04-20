import { getItem, setItem, KEYS } from './storageService'
import { SEED_SAVINGS } from '@/data/seed'
import type { SavingsEntry } from '@/types'

export function initSavings(): void {
  const existing = getItem<SavingsEntry>(KEYS.savings)
  if (existing.length === 0) {
    setItem(KEYS.savings, SEED_SAVINGS)
  }
}

export function getAllSavings(): SavingsEntry[] {
  return getItem<SavingsEntry>(KEYS.savings)
}

export function getSavingsForUser(userId: string): SavingsEntry[] {
  return getAllSavings().filter((s) => s.userId === userId)
}

export function recordSavings(data: Omit<SavingsEntry, 'id'>): SavingsEntry {
  const all = getAllSavings()
  const entry: SavingsEntry = {
    ...data,
    id: `sav_${Date.now()}`,
  }
  setItem(KEYS.savings, [...all, entry])
  return entry
}
