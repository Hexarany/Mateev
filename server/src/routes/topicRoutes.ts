import express from 'express'
import {
  getAllTopics,
  getTopicById,
  getTopicsByCategory,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../controllers/topicController'
import { authenticateToken, authorizeRole } from '../middleware/auth' 

const router = express.Router()

// PUBLIC: Чтение тем (логика блокировки внутри контроллера)
router.get('/', getAllTopics)
router.get('/:id', getTopicById) // Теперь поддерживает ID ИЛИ SLUG
router.get('/category/:categoryId', getTopicsByCategory)

// ADMIN ONLY: Создание, обновление, удаление
router.post('/', authenticateToken, authorizeRole('admin'), createTopic)
router.put('/:id', authenticateToken, authorizeRole('admin'), updateTopic)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteTopic)

export default router