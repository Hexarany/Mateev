import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

export interface Achievement {
  achievementId: string
  title: { ru: string; ro: string }
  description: { ru: string; ro: string }
  icon: string
  unlockedAt: Date
}

export interface QuizResult {
  quizId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  completedAt: Date
  timeSpent: number
  mode: 'practice' | 'exam'
}

export interface Progress {
  _id: string
  userId: string
  completedTopics: Array<{
    topicId: string
    completedAt: Date
    timeSpent: number
  }>
  viewedProtocols: Array<{
    protocolId: string
    viewedAt: Date
    timeSpent: number
  }>
  viewedGuidelines: Array<{
    guidelineId: string
    viewedAt: Date
  }>
  viewed3DModels: Array<{
    modelId: string
    viewedAt: Date
  }>
  viewedTriggerPoints: Array<{
    triggerPointId: string
    viewedAt: Date
  }>
  completedQuizzes: QuizResult[]
  achievements: Achievement[]
  stats: {
    totalStudyTime: number
    streak: number
    lastActivityDate: Date
    longestStreak: number
    totalTopicsCompleted: number
    totalQuizzesPassed: number
    averageQuizScore: number
  }
  createdAt: Date
  updatedAt: Date
}

// Get user progress
export function useProgress() {
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await api.get<Progress>('/progress')
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Mark topic as completed
export function useMarkTopicComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ topicId, timeSpent }: { topicId: string; timeSpent: number }) => {
      const response = await api.post('/progress/topic', { topicId, timeSpent })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}

// Mark protocol as viewed
export function useMarkProtocolViewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ protocolId, timeSpent }: { protocolId: string; timeSpent: number }) => {
      const response = await api.post('/progress/protocol', { protocolId, timeSpent })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}

// Save quiz result
export function useSaveQuizResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (result: {
      quizId: string
      score: number
      totalQuestions: number
      correctAnswers: number
      timeSpent: number
      mode: 'practice' | 'exam'
    }) => {
      const response = await api.post('/progress/quiz', result)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}
