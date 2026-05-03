import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  immichApiKey: string
  paperlessToken: string
  meilisearchKey: string
  n8nApiKey: string
  setImmichApiKey: (key: string) => void
  setPaperlessToken: (token: string) => void
  setMeilisearchKey: (key: string) => void
  setN8nApiKey: (key: string) => void
  clearAuth: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      immichApiKey: '',
      paperlessToken: '',
      meilisearchKey: '',
      n8nApiKey: '',
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
      setN8nApiKey: (key) => {
        set({ n8nApiKey: key })
        localStorage.setItem('n8n_api_key', key)
      },
      clearAuth: () => {
        set({ immichApiKey: '', paperlessToken: '', meilisearchKey: '', n8nApiKey: '' })
        localStorage.removeItem('immich_api_key')
        localStorage.removeItem('paperless_token')
        localStorage.removeItem('meilisearch_key')
        localStorage.removeItem('n8n_api_key')
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        immichApiKey: state.immichApiKey,
        paperlessToken: state.paperlessToken,
        meilisearchKey: state.meilisearchKey,
        n8nApiKey: state.n8nApiKey,
      }),
    },
  ),
)
