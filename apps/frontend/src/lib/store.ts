import { create } from 'zustand'

interface AppState {
  user: {
    id: string | null
    name: string | null
    email: string | null
  }
  theme: 'light' | 'dark'
  setUser: (user: { id: string; name: string; email: string } | null) => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useAppStore = create<AppState>((set) => ({
  user: { id: null, name: null, email: null },
  theme: 'light',
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
}))