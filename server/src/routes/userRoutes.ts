import express from 'express'
import {
  getEmailNotificationSettings,
  updateEmailNotificationSettings,
} from '../controllers/userController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Все маршруты требуют аутентификации
router.use(authenticateToken)

/**
 * GET /api/users/me/email-notifications
 * Получить настройки email уведомлений текущего пользователя
 */
router.get('/me/email-notifications', getEmailNotificationSettings)

/**
 * PATCH /api/users/me/email-notifications
 * Обновить настройки email уведомлений текущего пользователя
 */
router.patch('/me/email-notifications', updateEmailNotificationSettings)

export default router
