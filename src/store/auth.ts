import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  immichApiKey: string
  paperlessToken: string
  meilisearchKey: string
  setImmichApiKey: (key: string) => void
  setPaperlessToken: (token: string) => void
  setMeilisearchKey: (key: string) => void
  clearAuth: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      immichApiKey: '',
      paperlessToken: '',
      meilisearchKey: '',
      setImmichApiKey: (key) => {
        set({ immichApiKey: key })
        localStorage.setItem('immich_api_key', key)
      },
      setPaperlessToken: (token) => {
        set({ paperlessToken: token })
        localStorage.setItem('paperless_token', token)
      },
      setMeilisearchKey: (key) => {
        set({ meilisearchKey: key })
        localStorage.setItem('meilisearch_key', key)
      },
      clearAuth: () => {
        set({ immichApiKey: '', paperlessToken: '', meilisearchKey: '' })
        localStorage.removeItem('immich_api_key')
        localStorage.removeItem('paperless_token')
        localStorage.removeItem('meilisearch_key')
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        immichApiKey: state.immichApiKey,
        paperlessToken: state.paperlessToken,
        meilisearchKey: state.meilisearchKey,
      }),
    },
  ),
)
