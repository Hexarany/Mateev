import express from 'express'
import {
  getUserConversations,
  getConversationById,
  createOrGetPrivateConversation,
  createGroupConversation,
  getConversationMessages,
  deleteConversation,
  searchUsers,
} from '../controllers/chatController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// Middleware для проверки доступа к чату (только Basic и Premium)
const checkChatAccess = (req: any, res: any, next: any) => {
  const user = req.user

  // Админы и учителя имеют доступ
  if (user.role === 'admin' || user.role === 'teacher') {
    return next()
  }

  // Basic и Premium пользователи имеют доступ
  if (user.accessLevel === 'basic' || user.accessLevel === 'premium') {
    return next()
  }

  return res.status(403).json({
    message: 'Чат доступен только для пользователей с тарифом Basic или Premium',
  })
}

// Все маршруты требуют аутентификации и доступа к чату
router.use(authenticateToken, checkChatAccess)

// Получить все беседы пользователя
router.get('/conversations', getUserConversations)

// Получить беседу по ID
router.get('/conversations/:conversationId', getConversationById)

// Создать или получить приватную беседу
router.post('/conversations/private', createOrGetPrivateConversation)

// Создать групповую беседу
router.post('/conversations/group', createGroupConversation)

// Получить сообщения в беседе
router.get('/conversations/:conversationId/messages', getConversationMessages)

// Удалить беседу
router.delete('/conversations/:conversationId', deleteConversation)

// Поиск пользователей
router.get('/users/search', searchUsers)

export default router
