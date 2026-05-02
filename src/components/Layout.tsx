import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to NAS-logo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Unified dashboard for your personal NAS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div className="card">
                <h3 className="font-semibold">📷 Photos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coming soon: Immich integration</p>
              </div>
              <div className="card">
                <h3 className="font-semibold">📄 Documents</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coming soon: Paperless integration</p>
              </div>
              <div className="card">
                <h3 className="font-semibold">⚙️ Workflows</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coming soon: n8n integration</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
