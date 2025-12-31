import express from 'express'
import {
  chat,
  generateQuiz,
  getProgressAnalysis,
  getUsageStats,
} from '../controllers/aiController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Chat with AI assistant
router.post('/chat', chat)

// Get AI usage statistics
router.get('/usage', getUsageStats)

// Get progress analysis
router.get('/progress-analysis', getProgressAnalysis)

// Generate quiz questions (admin/teacher only)
router.post('/generate-quiz', authorizeRole('admin', 'teacher'), generateQuiz)

export default router
