import { useState } from 'react'
import { useNavigation } from '../store/navigation'
import Sidebar from './Sidebar'
import Header from './Header'
import Dashboard from './Dashboard'
import PhotosPage from './Photos/PhotosPage'
import DocumentsPage from './Documents/DocumentsPage'
import SearchPage from './Search/SearchPage'
import MonitoringPage from './Monitoring/MonitoringPage'
import WorkflowsPage from './Workflows/WorkflowsPage'
import SettingsPage from './Settings/SettingsPage'
import NtfyPage from './Ntfy/NtfyPage'
import GalleryGeneratorPage from './Gallery/GalleryGeneratorPage'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { currentPage } = useNavigation()

  const renderPage = () => {
    switch (currentPage) {
      case 'photos':
        return <PhotosPage />
      case 'documents':
        return <DocumentsPage />
      case 'search':
        return <SearchPage />
      case 'monitoring':
        return <MonitoringPage />
      case 'ntfy':
        return <NtfyPage />
      case 'settings':
        return <SettingsPage />
      case 'workflows':
        return <WorkflowsPage />
      case 'gallery':
        return <GalleryGeneratorPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}
