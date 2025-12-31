import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

export interface AuditLog {
  _id: string
  userId?: {
    _id: string
    email: string
    firstName: string
    lastName: string
  }
  userEmail?: string
  action: string
  entityType: string
  entityId?: string
  changes?: {
    field: string
    oldValue?: any
    newValue?: any
  }[]
  metadata?: any
  timestamp: string
  status: 'success' | 'failure'
  errorMessage?: string
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  page: number
  limit: number
}

export interface AuditLogsFilters {
  page?: number
  limit?: number
  action?: string
  entityType?: string
  status?: string
  userEmail?: string
  startDate?: string
  endDate?: string
}

export interface AuditLogsStats {
  totalLogs: number
  failedLogs: number
  successRate: number
  actionStats: { action: string; count: number }[]
}

/**
 * Fetch audit logs with filters and pagination
 */
export function useAuditLogs(filters: AuditLogsFilters) {
  return useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters.page) params.append('page', String(filters.page))
      if (filters.limit) params.append('limit', String(filters.limit))
      if (filters.action) params.append('action', filters.action)
      if (filters.entityType) params.append('entityType', filters.entityType)
      if (filters.status) params.append('status', filters.status)
      if (filters.userEmail) params.append('userEmail', filters.userEmail)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await api.get<AuditLogsResponse>(`/audit-logs?${params.toString()}`)
      return response.data
    },
    staleTime: 30 * 1000, // 30 seconds - audit logs change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch audit logs statistics
 */
export function useAuditLogsStats(days: number = 7) {
  return useQuery({
    queryKey: ['auditLogsStats', days],
    queryFn: async () => {
      const response = await api.get<AuditLogsStats>(`/audit-logs/stats?days=${days}`)
      return response.data
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Fetch available filter options
 */
export function useAuditLogsFilters() {
  return useQuery({
    queryKey: ['auditLogsFilters'],
    queryFn: async () => {
      const response = await api.get<{ actions: string[]; entityTypes: string[] }>('/audit-logs/filters')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - filters rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Search users for filter autocomplete
 */
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['searchUsers', query],
    queryFn: async () => {
      if (!query || query.length < 2) return []
      const response = await api.get<{ email: string; firstName: string; lastName: string }[]>(
        `/users/search?q=${encodeURIComponent(query)}`
      )
      return response.data
    },
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  })
}
