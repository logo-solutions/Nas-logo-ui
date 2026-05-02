import { useTheme } from '../store/theme'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['system', 'light', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const themeIcon =
    theme === 'system' ? '🌗' : theme === 'dark' ? '🌙' : '☀️'

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Search"
          >
            🔍
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            🔔
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={`Switch theme (current: ${theme})`}
            title={`Theme: ${theme}`}
          >
            {themeIcon}
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Profile"
          >
            👤
          </button>
        </div>
      </div>
    </header>
  )
}
