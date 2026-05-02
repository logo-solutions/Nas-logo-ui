import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => {
      const updateDOM = (theme: Theme) => {
        const isDarkMode =
          theme === 'dark' ||
          (theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)

        if (isDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }

        return isDarkMode
      }

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

      return {
        theme: 'system',
        isDark: prefersDark,
        setTheme: (theme) => {
          const isDark = updateDOM(theme)
          set({ theme, isDark })
        },
      }
    },
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const isDark = updateDOM(state.theme)
          state.isDark = isDark
        }
      },
    },
  ),
)

function updateDOM(theme: Theme): boolean {
  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDarkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  return isDarkMode
}
