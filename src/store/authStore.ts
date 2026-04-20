import { create } from 'zustand'
import type { User, Role } from '@/types'

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  role: Role | null
  isLoading: boolean
  setUser: (user: User) => void
  clearUser: () => void
  updateCurrentUser: (updates: Partial<User>) => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  role: null,
  isLoading: true,

  setUser: (user) =>
    set({ currentUser: user, isAuthenticated: true, role: user.role, isLoading: false }),

  clearUser: () =>
    set({ currentUser: null, isAuthenticated: false, role: null, isLoading: false }),

  updateCurrentUser: (updates) =>
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
    })),

  setLoading: (v) => set({ isLoading: v }),
}))
