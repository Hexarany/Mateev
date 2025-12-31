import { useQuery } from '@tanstack/react-query'
import { getCategories, getCategoryById } from '@/services/api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes - категории редко меняются
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useCategoryById(categoryId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => {
      if (!categoryId) throw new Error('Category ID is required')
      return getCategoryById(categoryId)
    },
    enabled: !!categoryId && enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
