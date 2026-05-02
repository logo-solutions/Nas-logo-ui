interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ open }: SidebarProps) {
  const menuItems = [
    { icon: '🏠', label: 'Dashboard', href: '#' },
    { icon: '📷', label: 'Photos', href: '#' },
    { icon: '📄', label: 'Documents', href: '#' },
    { icon: '⚙️', label: 'Workflows', href: '#' },
    { icon: '🔍', label: 'Search', href: '#' },
    { icon: '📊', label: 'Monitoring', href: '#' },
    { icon: '⚡', label: 'Settings', href: '#' },
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
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={!open ? item.label : undefined}
          >
            <span className="text-xl">{item.icon}</span>
            {open && <span className="text-sm">{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  )
}
