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
const checkChatAccess = async (req: any, res: any, next: any) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    // Получаем пользователя из базы данных
    const User = (await import('../models/User')).default
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

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
  } catch (error) {
    console.error('Chat access check error:', error)
    return res.status(500).json({ message: 'Ошибка проверки доступа' })
  }
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
