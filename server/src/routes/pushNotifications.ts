import express from 'express'
import {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  getMySubscriptions,
  sendNotification,
} from '../controllers/pushNotificationController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// Public route - get VAPID public key
router.get('/vapid-public-key', getVapidPublicKey)

// Protected routes - require authentication
router.use(authenticateToken)

// Subscribe to push notifications
router.post('/subscribe', subscribe)

// Unsubscribe from push notifications
router.post('/unsubscribe', unsubscribe)

// Get my subscriptions
router.get('/my-subscriptions', getMySubscriptions)

// Admin only - send notifications
router.post('/send', authorizeRole('admin', 'teacher'), sendNotification)

export default router
