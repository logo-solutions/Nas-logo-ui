import { create } from 'zustand'

export type Page = 'dashboard' | 'photos' | 'documents' | 'workflows' | 'search' | 'monitoring' | 'settings'

interface NavigationStore {
  currentPage: Page
  setCurrentPage: (page: Page) => void
}

export const useNavigation = create<NavigationStore>((set) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
}))
