import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  immichApiKey: string
  paperlessToken: string
  setImmichApiKey: (key: string) => void
  setPaperlessToken: (token: string) => void
  clearAuth: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      immichApiKey: '',
      paperlessToken: '',
      setImmichApiKey: (key) => {
        set({ immichApiKey: key })
        localStorage.setItem('immich_api_key', key)
      },
      setPaperlessToken: (token) => {
        set({ paperlessToken: token })
        localStorage.setItem('paperless_token', token)
      },
      clearAuth: () => {
        set({ immichApiKey: '', paperlessToken: '' })
        localStorage.removeItem('immich_api_key')
        localStorage.removeItem('paperless_token')
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        immichApiKey: state.immichApiKey,
        paperlessToken: state.paperlessToken,
      }),
    },
  ),
)
