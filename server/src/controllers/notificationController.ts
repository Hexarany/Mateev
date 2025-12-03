import { Response } from 'express'
import Notification, { NotificationType } from '../models/Notification'
import { CustomRequest } from '../middleware/auth'
import { getIO } from '../sockets/socketManager'

// Get user notifications with pagination
export const getUserNotifications = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { page = '1', limit = '20', unreadOnly = 'false' } = req.query

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const query: any = { userId }
    if (unreadOnly === 'true') {
      query.isRead = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false }),
    ])

    return res.json({
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      unreadCount,
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get unread count
export const getUnreadCount = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false })

    return res.json({ unreadCount })
  } catch (error: any) {
    console.error('Error getting unread count:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Mark notification as read
export const markAsRead = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { notificationId } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    // Emit socket event for real-time update
    const io = getIO()
    if (io) {
      io.to(userId.toString()).emit('notification_read', { notificationId })
    }

    return res.json({ message: 'Notification marked as read', notification })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    )

    // Emit socket event for real-time update
    const io = getIO()
    if (io) {
      io.to(userId.toString()).emit('all_notifications_read')
    }

    return res.json({ message: 'All notifications marked as read' })
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete notification
export const deleteNotification = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { notificationId } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    })

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    return res.json({ message: 'Notification deleted' })
  } catch (error: any) {
    console.error('Error deleting notification:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete all read notifications
export const deleteAllRead = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    await Notification.deleteMany({ userId, isRead: true })

    return res.json({ message: 'All read notifications deleted' })
  } catch (error: any) {
    console.error('Error deleting read notifications:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Create notification (internal use / admin)
export const createNotification = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { targetUserId, type, title, message, icon, actionUrl, actionText, metadata, priority } = req.body

    // Check if user is admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const notification = new Notification({
      userId: targetUserId,
      type,
      title,
      message,
      icon,
      actionUrl,
      actionText,
      metadata,
      priority: priority || 'normal',
    })

    await notification.save()

    // Emit socket event for real-time notification
    const io = getIO()
    if (io) {
      io.to(targetUserId).emit('new_notification', notification)
    }

    return res.status(201).json({ message: 'Notification created', notification })
  } catch (error: any) {
    console.error('Error creating notification:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Helper function to create and send notification (used by other controllers)
export const sendNotification = async (
  userId: string,
  type: NotificationType,
  title: { ru: string; ro: string },
  message: { ru: string; ro: string },
  options?: {
    icon?: string
    actionUrl?: string
    actionText?: { ru: string; ro: string }
    metadata?: any
    priority?: 'low' | 'normal' | 'high'
  }
) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      icon: options?.icon,
      actionUrl: options?.actionUrl,
      actionText: options?.actionText,
      metadata: options?.metadata,
      priority: options?.priority || 'normal',
    })

    await notification.save()

    // Emit socket event for real-time notification
    const io = getIO()
    if (io) {
      io.to(userId).emit('new_notification', notification)
    }

    return notification
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

// Broadcast notification to all users (admin only)
export const broadcastNotification = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const { title, message, icon, actionUrl, actionText, metadata, priority, userIds } = req.body

    // If userIds provided, send to specific users, otherwise to all
    let targetUserIds: string[]

    if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds
    } else {
      // Get all user IDs from User model
      const User = (await import('../models/User')).default
      const users = await User.find({}, '_id').lean()
      targetUserIds = users.map(u => u._id.toString())
    }

    const notifications = targetUserIds.map(userId => ({
      userId,
      type: 'system_announcement' as NotificationType,
      title,
      message,
      icon,
      actionUrl,
      actionText,
      metadata,
      priority: priority || 'high',
      sentAt: new Date(),
    }))

    await Notification.insertMany(notifications)

    // Emit socket event for real-time notification
    const io = getIO()
    if (io) {
      io.emit('new_announcement', { title, message })
    }

    return res.status(201).json({
      message: 'Broadcast notification sent',
      recipientCount: targetUserIds.length,
    })
  } catch (error: any) {
    console.error('Error broadcasting notification:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}
