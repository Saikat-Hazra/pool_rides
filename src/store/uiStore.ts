import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIState {
  toasts: Toast[]
  isModalOpen: boolean
  modalContent: string | null
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
  openModal: (content: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isModalOpen: false,
  modalContent: null,

  addToast: (message, type = 'info') =>
    set((s) => {
      const id = `toast_${Date.now()}`
      const toast: Toast = { id, message, type }
      setTimeout(() => {
        set((inner) => ({ toasts: inner.toasts.filter((t) => t.id !== id) }))
      }, 4000)
      return { toasts: [...s.toasts, toast] }
    }),

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
}))
