import { useQuery } from '@tanstack/react-query'
import { getAnatomyModels3D, getAnatomyModel3DById } from '@/services/api'

/**
 * Hook to fetch all 3D anatomy models
 */
export function useAnatomyModels3D() {
  return useQuery({
    queryKey: ['anatomyModels3D'],
    queryFn: getAnatomyModels3D,
    staleTime: 10 * 60 * 1000, // 10 minutes - 3D models rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch a single 3D anatomy model by ID
 */
export function useAnatomyModel3DById(modelId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['anatomyModel3D', modelId],
    queryFn: async () => {
      if (!modelId) throw new Error('Model ID is required')
      return await getAnatomyModel3DById(modelId)
    },
    enabled: !!modelId && enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes - individual models with large assets
    gcTime: 45 * 60 * 1000, // 45 minutes
  })
}
