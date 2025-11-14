import express from 'express'
import { body } from 'express-validator'
import {
  createOrder,
  captureOrder,
  getOrderDetails,
  handleWebhook,
} from '../controllers/paypalController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// POST /api/paypal/create-order - Создать PayPal заказ (требует авторизации)
router.post(
  '/create-order',
  [
    authenticateToken,
    body('planId')
      .notEmpty()
      .withMessage('План подписки обязателен')
      .isIn(['monthly', 'yearly'])
      .withMessage('Недопустимый план подписки'),
  ],
  createOrder
)

// POST /api/paypal/capture-order - Завершить платеж PayPal (требует авторизации)
router.post(
  '/capture-order',
  [
    authenticateToken,
    body('orderId')
      .notEmpty()
      .withMessage('ID заказа обязателен'),
    body('planId')
      .notEmpty()
      .withMessage('План подписки обязателен')
      .isIn(['monthly', 'yearly'])
      .withMessage('Недопустимый план подписки'),
  ],
  captureOrder
)

// GET /api/paypal/order/:orderId - Получить детали заказа (требует авторизации)
router.get('/order/:orderId', authenticateToken, getOrderDetails)

// POST /api/paypal/webhook - Обработать PayPal webhook (публичный эндпоинт)
router.post('/webhook', handleWebhook)

export default router
