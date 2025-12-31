import { Response } from 'express'
import { CustomRequest } from '../middleware/auth'
import { sendChatMessage, generateQuizQuestions, analyzeProgress } from '../services/ai/claude'
import User from '../models/User'

// Rate limits per tier (requests per day)
const RATE_LIMITS = {
  free: 5,
  basic: 50,
  premium: 200,
}

/**
 * Chat with AI assistant
 */
export const chat = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { message, conversationHistory = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Get user to check access level and rate limit
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check rate limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const requestsToday = user.aiRequestsToday || 0
    const lastRequestDate = user.lastAiRequestDate || new Date(0)

    // Reset counter if it's a new day
    if (lastRequestDate < today) {
      user.aiRequestsToday = 0
      user.lastAiRequestDate = today
    }

    const limit = RATE_LIMITS[user.accessLevel as keyof typeof RATE_LIMITS] || 0
    const currentRequests = user.aiRequestsToday || 0
    if (currentRequests >= limit) {
      return res.status(429).json({
        error: 'Достигнут дневной лимит запросов к AI-ассистенту',
        limit,
        used: currentRequests,
      })
    }

    // Send message to Claude
    const response = await sendChatMessage(message, conversationHistory)

    // Update user's request counter
    user.aiRequestsToday = currentRequests + 1
    user.lastAiRequestDate = new Date()
    await user.save()

    return res.json({
      message: response.message,
      usage: response.usage,
      remainingRequests: limit - user.aiRequestsToday,
    })
  } catch (error: any) {
    console.error('[AI Controller] Chat error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

/**
 * Generate quiz questions for a topic (admin/teacher only)
 */
export const generateQuiz = async (req: CustomRequest, res: Response) => {
  try {
    const { topicName, topicDescription, questionCount = 5 } = req.body

    if (!topicName || !topicDescription) {
      return res.status(400).json({ error: 'Topic name and description are required' })
    }

    const questions = await generateQuizQuestions(topicName, topicDescription, questionCount)

    return res.json({ questions })
  } catch (error: any) {
    console.error('[AI Controller] Quiz generation error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

/**
 * Analyze student progress
 */
export const getProgressAnalysis = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // TODO: Fetch actual completed topics, quiz scores, weak areas from database
    // For now, using placeholder data
    const completedTopics = ['Анатомия мышц спины', 'Триггерные точки']
    const quizScores = [
      { topic: 'Анатомия мышц спины', score: 85 },
      { topic: 'Триггерные точки', score: 70 },
    ]
    const weakAreas = ['Нервная система']

    const analysis = await analyzeProgress(completedTopics, quizScores, weakAreas)

    return res.json({ analysis })
  } catch (error: any) {
    console.error('[AI Controller] Progress analysis error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

/**
 * Get AI usage stats for current user
 */
export const getUsageStats = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastRequestDate = user.lastAiRequestDate || new Date(0)
    const requestsToday = lastRequestDate >= today ? user.aiRequestsToday || 0 : 0

    const limit = RATE_LIMITS[user.accessLevel as keyof typeof RATE_LIMITS] || 0

    return res.json({
      used: requestsToday,
      limit,
      remaining: limit - requestsToday,
      accessLevel: user.accessLevel,
    })
  } catch (error: any) {
    console.error('[AI Controller] Usage stats error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
