import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

export function useMySchedule() {
  return useQuery({
    queryKey: ['schedule', 'my'],
    queryFn: async () => {
      const response = await api.get('/schedule/my')
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - расписание может меняться
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useGroupSchedule(groupId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['schedule', 'group', groupId],
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID is required')
      const response = await api.get(`/schedule/group/${groupId}`)
      return response.data
    },
    enabled: !!groupId && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000,
  })
}

export function useScheduleById(scheduleId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: async () => {
      if (!scheduleId) throw new Error('Schedule ID is required')
      const response = await api.get(`/schedule/${scheduleId}`)
      return response.data
    },
    enabled: !!scheduleId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  })
}
