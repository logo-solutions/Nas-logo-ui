import { gatewayFetch } from '../../lib/gateway'

export default function NtfyPage() {
  const sendTestNotification = async () => {
    try {
      const response = await gatewayFetch('/ntfy/publish', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'nas-logo',
          message: 'Test notification from NAS-logo UI',
          title: 'Test',
        }),
      })
      if (response.ok) {
        alert('✓ Notification sent!')
      } else {
        alert('✗ Failed to send notification')
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
      alert('✗ Failed to send notification')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Push Notifications
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Real-time alerts and notifications via ntfy.sh
        </p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              NAS-logo Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Subscribe to the <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">nas-logo</code> topic for system alerts
            </p>
          </div>
          <a
            href="http://100.113.214.55:8090/nas-logo"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            🔔 Open ntfy →
          </a>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <h4 className="font-semibold text-gray-900 dark:text-white">Subscribe:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Desktop: Use an app like <a href="https://apps.apple.com/app/ntfy/id1625396347" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ntfy iOS app</a></li>
            <li>Web: Visit ntfy.sh and subscribe to <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">nas-logo</code></li>
            <li>Terminal: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded block mt-1">curl ntfy.sh/nas-logo</code></li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Test Push</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send a test notification to verify your subscription
          </p>
          <button
            onClick={sendTestNotification}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Send Test
          </button>
        </div>

        <div className="card space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Documentation</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Learn more about ntfy and advanced features
          </p>
          <a
            href="https://docs.ntfy.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            📖 Read Docs →
          </a>
        </div>
      </div>
    </div>
  )
}
