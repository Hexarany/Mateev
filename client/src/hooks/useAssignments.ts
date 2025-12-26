import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import {
  getMySubmissions,
  submitAssignment,
  updateSubmission,
  uploadHomeworkFile,
} from '@/services/api'

export function useMyAssignments() {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['assignments', 'my'],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated')
      const data = await getMySubmissions(token)
      return data
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes - задания могут обновляться
    gcTime: 10 * 60 * 1000,
  })
}

export function useGroupAssignments(groupId: string | undefined, enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['assignments', 'group', groupId],
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID is required')
      if (!token) throw new Error('Not authenticated')
      const response = await api.get(`/groups/${groupId}/assignments`)
      return response.data
    },
    enabled: !!groupId && !!token && enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useAssignmentById(assignmentId: string | undefined, enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      if (!assignmentId) throw new Error('Assignment ID is required')
      if (!token) throw new Error('Not authenticated')
      const response = await api.get(`/assignments/${assignmentId}`)
      return response.data
    },
    enabled: !!assignmentId && !!token && enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

// Mutations for assignments

export function useSubmitAssignment() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ assignmentId, data }: { assignmentId: string; data: any }) => {
      if (!token) throw new Error('Not authenticated')
      return await submitAssignment(assignmentId, data, token)
    },
    onSuccess: () => {
      // Invalidate assignments query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['assignments', 'my'] })
    },
  })
}

export function useUpdateSubmission() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ submissionId, data }: { submissionId: string; data: any }) => {
      if (!token) throw new Error('Not authenticated')
      return await updateSubmission(submissionId, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', 'my'] })
    },
  })
}

export function useUploadHomeworkFile() {
  const { token } = useAuth()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!token) throw new Error('Not authenticated')
      return await uploadHomeworkFile(file, token)
    },
  })
}
