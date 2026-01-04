import express from 'express'
import {
  generateLinkCode,
  unlinkTelegram,
  getLinkStatus,
  updateNotificationSettings,
  createGroupChat
} from '../controllers/telegramController'
import { authenticateToken, authorizeRole } from '../middleware/auth'
import { telegramWebhookCallback } from '../services/telegram'

const router = express.Router()

// Webhook endpoint is now registered directly in index.ts (public, no auth)
// All routes here require authentication
router.use(authenticateToken)

// Linking/unlinking
router.post('/generate-link-code', generateLinkCode)
router.post('/unlink', unlinkTelegram)
router.get('/link-status', getLinkStatus)

// Notification settings
router.put('/notification-settings', updateNotificationSettings)

// Group chats (admin and teacher only)
router.post('/group-chat', authorizeRole('admin', 'teacher'), createGroupChat)

export default router
