export default function MonitoringPage() {
  const metrics = [
    { label: 'CPU Usage', value: '45%', trend: 'stable' },
    { label: 'Memory Usage', value: '62%', trend: 'up' },
    { label: 'Disk Usage', value: '78%', trend: 'up' },
    { label: 'Network In', value: '2.3 Mbps', trend: 'stable' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Monitoring</h2>
        <p className="text-gray-600 dark:text-gray-400">
          System health and performance metrics
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="card space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            <p className={`text-xs ${metric.trend === 'up' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
              {metric.trend === 'up' ? '📈 Increasing' : '✓ Stable'}
            </p>
          </div>
        ))}
      </div>

      {/* Grafana Dashboard */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Full Monitoring Dashboard
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed metrics and visualizations
            </p>
          </div>
          <a
            href="http://100.113.214.55:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            📊 Open Grafana →
          </a>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Note: iframes require <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">allow_embedding = true</code> in grafana.ini
          </p>

          {/* Grafana Home Dashboard */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <iframe
              src="http://100.113.214.55:3000/d/eHyB3-pVk/home?orgId=1&kiosk=1&refresh=30s"
              width="100%"
              height="400"
              frameBorder="0"
              className="bg-white dark:bg-gray-800"
            />
          </div>

          {/* Node Exporter Dashboard */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <iframe
              src="http://100.113.214.55:3000/d/rYdddlPWk/node-exporter-full?orgId=1&kiosk=1&refresh=30s"
              width="100%"
              height="400"
              frameBorder="0"
              className="bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Alerts
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>✓ All systems operational</p>
        </div>
      </div>
    </div>
  )
}
