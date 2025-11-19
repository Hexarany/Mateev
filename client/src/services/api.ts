import axios from 'axios'
import type { Category, Topic, Quiz, SubscriptionPlan, CurrentSubscription, Subscription } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories')
  return response.data
}

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get(`/categories/${id}`)
  return response.data
}

// Topics
export const getTopics = async (): Promise<Topic[]> => {
  const response = await api.get('/topics')
  return response.data
}

export const getTopicById = async (id: string): Promise<Topic> => {
  const response = await api.get(`/topics/${id}`)
  return response.data
}

export const getTopicsByCategory = async (categoryId: string): Promise<Topic[]> => {
  const response = await api.get(`/topics/category/${categoryId}`)
  return response.data
}

// --- TOPICS CRUD (Для Admin Panel) ---

export const createTopic = async (topicData: any, token: string): Promise<Topic> => {
  const response = await api.post('/topics', topicData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateTopic = async (id: string, topicData: any, token: string): Promise<Topic> => {
  const response = await api.put(`/topics/${id}`, topicData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteTopic = async (id: string, token: string): Promise<void> => {
  await api.delete(`/topics/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// Quizzes
export const getQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.get('/quizzes')
  return response.data
}

export const getQuizById = async (id: string): Promise<Quiz> => {
  const response = await api.get(`/quizzes/${id}`)
  return response.data
}

export const getQuizzesByTopic = async (topicId: string): Promise<Quiz[]> => {
  const response = await api.get(`/quizzes/topic/${topicId}`)
  return response.data
}

// --- QUIZZES CRUD (Для Admin Panel) ---

export const createQuiz = async (quizData: any, token: string): Promise<Quiz> => {
  const response = await api.post('/quizzes', quizData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateQuiz = async (id: string, quizData: any, token: string): Promise<Quiz> => {
  const response = await api.put(`/quizzes/${id}`, quizData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteQuiz = async (id: string, token: string): Promise<void> => {
  await api.delete(`/quizzes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// Media
export const uploadMedia = async (file: File): Promise<any> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Subscriptions
export const getSubscriptionPlans = async (): Promise<{ plans: SubscriptionPlan[]; trialDays: number }> => {
  const response = await api.get('/subscriptions/plans')
  return response.data
}

export const getCurrentSubscription = async (token: string): Promise<CurrentSubscription> => {
  const response = await api.get('/subscriptions/current', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const startTrial = async (token: string): Promise<any> => {
  const response = await api.post('/subscriptions/start-trial', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const cancelSubscription = async (token: string): Promise<any> => {
  const response = await api.post('/subscriptions/cancel', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getSubscriptionHistory = async (token: string): Promise<{ subscriptions: Subscription[] }> => {
  const response = await api.get('/subscriptions/history', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// PayPal
export const createPayPalOrder = async (token: string, planId: string): Promise<any> => {
  const response = await api.post('/paypal/create-order', { planId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const capturePayPalOrder = async (token: string, orderId: string, planId: string): Promise<any> => {
  const response = await api.post('/paypal/capture-order', { orderId, planId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export default api