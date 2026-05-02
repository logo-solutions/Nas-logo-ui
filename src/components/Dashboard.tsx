import { useNavigation } from '../store/navigation'

export default function Dashboard() {
  const { setCurrentPage } = useNavigation()

  const services = [
    {
      icon: '📷',
      label: 'Photos',
      page: 'photos' as const,
      description: 'Manage and view your photos from Immich',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '📄',
      label: 'Documents',
      page: 'documents' as const,
      description: 'Manage documents with Paperless',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '⚙️',
      label: 'Workflows',
      page: 'workflows' as const,
      description: 'Create and manage automations with n8n',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: '🔍',
      label: 'Search',
      page: 'search' as const,
      description: 'Full-text search powered by Meilisearch',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: '📊',
      label: 'Monitoring',
      page: 'monitoring' as const,
      description: 'View system metrics and health',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: '⚡',
      label: 'Settings',
      page: 'settings' as const,
      description: 'Configure and manage your NAS',
      color: 'from-gray-500 to-slate-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to NAS-logo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Unified dashboard for your personal NAS infrastructure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <button
            key={service.label}
            onClick={() => setCurrentPage(service.page)}
            className="group relative overflow-hidden rounded-lg p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
            />

            {/* Border */}
            <div className="absolute inset-0 rounded-lg border border-gray-200 dark:border-gray-700 group-hover:border-current opacity-50 transition-all duration-300" />

            {/* Content */}
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-4xl">{service.icon}</span>
                <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{service.label}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {service.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Start</h2>
        <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✓ Configure Immich API key in Settings</li>
          <li>→ Browse your photos in Photos section</li>
          <li>→ Manage documents in Documents section</li>
          <li>→ Monitor your system in Monitoring section</li>
        </ol>
      </div>
    </div>
  )
}
