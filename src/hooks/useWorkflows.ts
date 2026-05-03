import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWorkflows,
  getExecutions,
  activateWorkflow,
  deactivateWorkflow,
  executeWorkflow,
} from '../lib/n8n'

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
    enabled: !!localStorage.getItem('n8n_api_key'),
    refetchInterval: 30000,
  })
}

export function useExecutions() {
  return useQuery({
    queryKey: ['executions'],
    queryFn: () => getExecutions(10),
    enabled: !!localStorage.getItem('n8n_api_key'),
    refetchInterval: 15000,
  })
}

export function useActivateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => activateWorkflow(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  })
}

export function useDeactivateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateWorkflow(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  })
}

export function useExecuteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => executeWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] })
    },
  })
}
