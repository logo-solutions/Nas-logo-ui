import {
  useWorkflows,
  useExecutions,
  useActivateWorkflow,
  useDeactivateWorkflow,
  useExecuteWorkflow,
} from '../../hooks/useWorkflows'

export default function WorkflowsPage() {
  const { data: workflows = [], isLoading, error } = useWorkflows()
  const { data: executions = [] } = useExecutions()
  const { mutate: activate, isPending: isActivating } = useActivateWorkflow()
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateWorkflow()
  const { mutate: execute, isPending: isExecuting } = useExecuteWorkflow()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Workflows
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {workflows.filter((w) => w.active).length} active · {workflows.length} total
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Error loading workflows: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No workflows found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow) => {
            const lastExecution = executions.find((e) => e.workflowId === workflow.id)

            return (
              <div
                key={workflow.id}
                className="card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {workflow.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                          workflow.active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <span className={workflow.active ? '●' : '○'} />
                        {workflow.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {workflow.tags && workflow.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {workflow.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.name}
                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {workflow.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400">
                            +{workflow.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        workflow.active ? deactivate(workflow.id) : activate(workflow.id)
                      }
                      disabled={isActivating || isDeactivating}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isActivating || isDeactivating ? '...' : workflow.active ? 'Deactivate' : 'Activate'}
                    </button>
                    {workflow.active && (
                      <button
                        onClick={() => execute(workflow.id)}
                        disabled={isExecuting}
                        className="px-3 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isExecuting ? '...' : 'Execute'}
                      </button>
                    )}
                  </div>
                </div>

                {lastExecution && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>
                      Last execution: {new Date(lastExecution.startedAt).toLocaleString()} —{' '}
                      {lastExecution.finished ? '✓ Finished' : '○ Running'}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
