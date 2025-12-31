import express from 'express'
import {
  generateTopic,
  generateQuiz,
  generateProtocol,
  generateCourse,
  previewContent,
} from '../controllers/contentGeneratorController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// All routes require admin authorization
router.use(authenticateToken)
router.use(authorizeRole('admin', 'teacher'))

// Generate content
router.post('/topic', generateTopic)
router.post('/quiz', generateQuiz)
router.post('/protocol', generateProtocol)
router.post('/course', generateCourse)

// Preview content (without saving)
router.post('/preview', previewContent)

export default router
