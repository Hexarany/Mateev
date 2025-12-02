// server/src/routes/quizRoutes.ts
import express from 'express'
import {
  getAllQuizzes,
  getQuizById,
  getQuizzesByTopic,
  createQuiz, // НОВЫЙ
  updateQuiz, // НОВЫЙ
  deleteQuiz, // НОВЫЙ
} from '../controllers/quizController'
import { authenticateToken, authorizeRole, optionalAuth } from '../middleware/auth'

const router = express.Router()

// PUBLIC: Чтение викторин
router.get('/', optionalAuth, getAllQuizzes)
router.get('/:id', optionalAuth, getQuizById)
router.get('/topic/:topicId', optionalAuth, getQuizzesByTopic)

// ADMIN ONLY: CRUD для викторин
router.post('/', authenticateToken, authorizeRole('admin'), createQuiz)
router.put('/:id', authenticateToken, authorizeRole('admin'), updateQuiz)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteQuiz)

export default router