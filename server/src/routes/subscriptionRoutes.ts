import express from 'express'
import { body } from 'express-validator'
import {
  getPlans,
  getCurrentSubscription,
  startTrial,
  cancelSubscription,
  getSubscriptionHistory,
  createSubscription,
  checkExpiredSubscriptions,
} from '../controllers/subscriptionController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// GET /api/subscriptions/plans - Получить доступные планы (публичный эндпоинт)
router.get('/plans', getPlans)

// GET /api/subscriptions/current - Получить текущую подписку пользователя (требует авторизации)
router.get('/current', authenticateToken, getCurrentSubscription)

// POST /api/subscriptions/start-trial - Начать бесплатный пробный период (требует авторизации)
router.post('/start-trial', authenticateToken, startTrial)

// POST /api/subscriptions/cancel - Отменить автопродление подписки (требует авторизации)
router.post('/cancel', authenticateToken, cancelSubscription)

// GET /api/subscriptions/history - Получить историю подписок пользователя (требует авторизации)
router.get('/history', authenticateToken, getSubscriptionHistory)

// POST /api/subscriptions/create - Создать новую подписку (требует авторизации)
router.post(
  '/create',
  [
    authenticateToken,
    body('planId')
      .notEmpty()
      .withMessage('План подписки обязателен')
      .isIn(['monthly', 'yearly'])
      .withMessage('Недопустимый план подписки'),
    body('paymentMethod')
      .optional()
      .isString()
      .withMessage('Метод оплаты должен быть строкой'),
  ],
  createSubscription
)

// POST /api/subscriptions/check-expired - Проверить истекшие подписки (для cron)
router.post('/check-expired', checkExpiredSubscriptions)

export default router
