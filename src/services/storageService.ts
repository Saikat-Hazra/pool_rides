// ─── Storage keys ─────────────────────────────────────────────────────────────

export const KEYS = {
  users: 'pr_users',
  colleges: 'pr_colleges',
  pools: 'pr_pools',
  members: 'pr_members',
  messages: 'pr_messages',
  savings: 'pr_savings',
  reports: 'pr_reports',
  session: 'pr_session',
  seeded: 'pr_seeded',
} as const

// ─── Generic helpers ──────────────────────────────────────────────────────────

export function getItem<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    console.error(`[StorageService] Failed to parse key "${key}". Clearing.`)
    localStorage.removeItem(key)
    return []
  }
}

export function setItem<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`[StorageService] Failed to save key "${key}":`, e)
  }
}

export function getSingle<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export function setSingle<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`[StorageService] Failed to save key "${key}":`, e)
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(key)
}

export function clearAll(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
