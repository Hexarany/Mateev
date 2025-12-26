import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

export function useMyGroups() {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['groups', 'my'],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated')
      const response = await api.get('/groups/my')
      return response.data
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes - группы могут обновляться
    gcTime: 15 * 60 * 1000,
  })
}

export function useAllGroups() {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['groups', 'all'],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated')
      const response = await api.get('/groups')
      return response.data
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useGroupById(groupId: string | undefined, enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID is required')
      if (!token) throw new Error('Not authenticated')
      const response = await api.get(`/groups/${groupId}`)
      return response.data
    },
    enabled: !!groupId && !!token && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}
