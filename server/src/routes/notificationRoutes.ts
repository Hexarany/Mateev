import express from 'express'
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createNotification,
  broadcastNotification,
} from '../controllers/notificationController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get user notifications
router.get('/', getUserNotifications)

// Get unread count
router.get('/unread-count', getUnreadCount)

// Mark notification as read
router.patch('/:notificationId/read', markAsRead)

// Mark all as read
router.patch('/read-all', markAllAsRead)

// Delete notification
router.delete('/:notificationId', deleteNotification)

// Delete all read notifications
router.delete('/read/all', deleteAllRead)

// Create notification (admin/teacher only)
router.post('/create', createNotification)

// Broadcast notification to all users (admin only)
router.post('/broadcast', broadcastNotification)

export default router
