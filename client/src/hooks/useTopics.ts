import { useQuery } from '@tanstack/react-query'
import { getTopics, getTopicById, getTopicsByCategory } from '@/services/api'

export function useTopics() {
  return useQuery({
    queryKey: ['topics'],
    queryFn: getTopics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  })
}

export function useTopicsByCategory(categoryId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['topics', 'category', categoryId],
    queryFn: () => {
      if (!categoryId) throw new Error('Category ID is required')
      return getTopicsByCategory(categoryId)
    },
    enabled: !!categoryId && enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function useTopicById(topicId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: () => {
      if (!topicId) throw new Error('Topic ID is required')
      return getTopicById(topicId)
    },
    enabled: !!topicId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - контент может обновляться
    gcTime: 20 * 60 * 1000,
  })
}
