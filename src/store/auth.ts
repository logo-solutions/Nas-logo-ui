import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  gatewayToken: string
  isHydrated: boolean
  setGatewayToken: (token: string) => void
  clearAuth: () => void
  setHydrated: (hydrated: boolean) => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      gatewayToken: '',
      isHydrated: false,
      setGatewayToken: (token) => {
        set({ gatewayToken: token })
      },
      clearAuth: () => {
        set({ gatewayToken: '' })
      },
      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated })
      },
    }),
    {
      name: 'auth-storage-v2',
      partialize: (state) => ({
        gatewayToken: state.gatewayToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
        }
      },
    },
  ),
)
