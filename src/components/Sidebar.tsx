import { useNavigation, type Page } from '../store/navigation'

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

interface MenuItem {
  icon: string
  label: string
  page?: Page
  href?: string
}

export default function Sidebar({ open }: SidebarProps) {
  const { currentPage, setCurrentPage } = useNavigation()

  const menuItems: MenuItem[] = [
    { icon: '🏠', label: 'Dashboard', page: 'dashboard' },
    { icon: '📷', label: 'Photos', href: 'https://immich.logo-solutions.fr' },
    { icon: '📄', label: 'Documents', href: 'http://100.113.214.55:8010' },
    { icon: '🎨', label: 'Gallery', page: 'gallery' },
    { icon: '🔄', label: 'Workflows', page: 'workflows' },
    { icon: '🔍', label: 'Search', page: 'search' },
    { icon: '📊', label: 'Monitoring', page: 'monitoring' },
    { icon: '🔔', label: 'Notifications', page: 'ntfy' },
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
        {menuItems.map((item) => {
          // External links (Photos, Documents)
          if (item.href) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                title={!open ? item.label : undefined}
              >
                <span className="text-xl">{item.icon}</span>
                {open && <span className="text-sm">{item.label}</span>}
              </a>
            )
          }

          // Internal pages
          return (
            <button
              key={item.label}
              onClick={() => item.page && setCurrentPage(item.page)}
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
          )
        })}
      </nav>
    </aside>
  )
}
