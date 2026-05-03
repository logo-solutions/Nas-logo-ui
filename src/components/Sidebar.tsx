import { useNavigation, type Page } from '../store/navigation'

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ open }: SidebarProps) {
  const { currentPage, setCurrentPage } = useNavigation()

  const menuItems: { icon: string; label: string; page: Page }[] = [
    { icon: '🏠', label: 'Dashboard', page: 'dashboard' },
    { icon: '📷', label: 'Photos', page: 'photos' },
    { icon: '📄', label: 'Documents', page: 'documents' },
    { icon: '🔄', label: 'Workflows', page: 'workflows' },
    { icon: '🔍', label: 'Search', page: 'search' },
    { icon: '📊', label: 'Monitoring', page: 'monitoring' },
    { icon: '⚙️', label: 'Settings', page: 'settings' },
  ]

  return (
    <aside
      className={`${
        open ? 'w-64' : 'w-20'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-blue-600">
          {open ? '🌐 NAS' : '🌐'}
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setCurrentPage(item.page)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              currentPage === item.page
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            title={!open ? item.label : undefined}
          >
            <span className="text-xl">{item.icon}</span>
            {open && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
