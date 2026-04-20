import { create } from 'zustand'
import type { Pool, DiscoverFilters } from '@/types'

interface PoolState {
  pools: Pool[]
  activePool: Pool | null
  filters: DiscoverFilters
  setPools: (pools: Pool[]) => void
  addPool: (pool: Pool) => void
  updatePool: (updated: Pool) => void
  setActivePool: (pool: Pool | null) => void
  setFilters: (filters: Partial<DiscoverFilters>) => void
  resetFilters: () => void
}

const defaultFilters: DiscoverFilters = {
  area: '',
  campus: '',
  day: '',
  timeStart: '',
  timeEnd: '',
  seatsMin: 1,
  womenOnly: false,
  verifiedOnly: false,
}

export const usePoolStore = create<PoolState>((set) => ({
  pools: [],
  activePool: null,
  filters: defaultFilters,

  setPools: (pools) => set({ pools }),
  addPool: (pool) => set((s) => ({ pools: [...s.pools, pool] })),
  updatePool: (updated) =>
    set((s) => ({ pools: s.pools.map((p) => (p.id === updated.id ? updated : p)) })),
  setActivePool: (pool) => set({ activePool: pool }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
}))
