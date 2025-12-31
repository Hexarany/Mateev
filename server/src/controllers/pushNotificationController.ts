import { Request, Response } from 'express'
import webpush from 'web-push'
import PushSubscription from '../models/PushSubscription'
import User from '../models/User'

// VAPID keys - should be generated once and stored in env
// Generate with: npx web-push generate-vapid-keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
}

// Configure web-push
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:support@anatomia.md',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

/**
 * Get VAPID public key for client-side subscription
 */
export const getVapidPublicKey = async (req: Request, res: Response) => {
  try {
    if (!vapidKeys.publicKey) {
      return res.status(500).json({
        message: 'VAPID keys not configured. Run: npx web-push generate-vapid-keys',
      })
    }

    res.json({ publicKey: vapidKeys.publicKey })
  } catch (error) {
    console.error('Error getting VAPID key:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * Subscribe to push notifications
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { endpoint, keys } = req.body

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: 'Invalid subscription data' })
    }

    // Check if subscription already exists
    let subscription = await PushSubscription.findOne({ endpoint })

    if (subscription) {
      // Update existing subscription
      subscription.userId = req.user!._id
      subscription.keys = keys
      subscription.userAgent = req.get('User-Agent')
      subscription.lastUsed = new Date()
      await subscription.save()
    } else {
      // Create new subscription
      subscription = await PushSubscription.create({
        userId: req.user!._id,
        endpoint,
        keys,
        userAgent: req.get('User-Agent'),
      })
    }

    res.status(201).json({
      message: 'Successfully subscribed to push notifications',
      subscription,
    })
  } catch (error: any) {
    console.error('Error subscribing to push notifications:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

/**
 * Unsubscribe from push notifications
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint required' })
    }

    await PushSubscription.findOneAndDelete({
      userId: req.user!._id,
      endpoint,
    })

    res.json({ message: 'Successfully unsubscribed from push notifications' })
  } catch (error: any) {
    console.error('Error unsubscribing:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

/**
 * Get all subscriptions for current user
 */
export const getMySubscriptions = async (req: Request, res: Response) => {
  try {
    const subscriptions = await PushSubscription.find({ userId: req.user!._id })
    res.json(subscriptions)
  } catch (error: any) {
    console.error('Error getting subscriptions:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

/**
 * Send push notification to specific users
 * (Admin only)
 */
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { userIds, title, body, data, icon, badge, url } = req.body

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' })
    }

    // Find all subscriptions for specified users
    const query = userIds && userIds.length > 0
      ? { userId: { $in: userIds } }
      : {} // If no userIds, send to all users

    const subscriptions = await PushSubscription.find(query)

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscriptions found' })
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/pwa-192x192.png',
      badge: badge || '/pwa-192x192.png',
      data: data || {},
      url: url || '/',
    })

    // Send notifications in parallel
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
              },
            },
            payload
          )

          // Update last used
          subscription.lastUsed = new Date()
          await subscription.save()

          return { success: true, userId: subscription.userId }
        } catch (error: any) {
          console.error(`Failed to send to ${subscription.endpoint}:`, error)

          // If subscription is no longer valid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.findByIdAndDelete(subscription._id)
          }

          return { success: false, userId: subscription.userId, error: error.message }
        }
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    res.json({
      message: 'Notifications sent',
      successful,
      failed,
      total: subscriptions.length,
    })
  } catch (error: any) {
    console.error('Error sending notifications:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

/**
 * Send notification to specific user (triggered by system events)
 * Internal use only
 */
export const sendNotificationToUser = async (
  userId: string,
  notification: {
    title: string
    body: string
    icon?: string
    badge?: string
    data?: any
    url?: string
  }
) => {
  try {
    const subscriptions = await PushSubscription.find({ userId })

    if (subscriptions.length === 0) {
      console.log(`No subscriptions found for user ${userId}`)
      return { sent: 0, failed: 0 }
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/pwa-192x192.png',
      badge: notification.badge || '/pwa-192x192.png',
      data: notification.data || {},
      url: notification.url || '/',
    })

    let sent = 0
    let failed = 0

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
          },
          payload
        )

        subscription.lastUsed = new Date()
        await subscription.save()
        sent++
      } catch (error: any) {
        console.error(`Failed to send notification:`, error)
        failed++

        // Remove invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          await PushSubscription.findByIdAndDelete(subscription._id)
        }
      }
    }

    return { sent, failed }
  } catch (error) {
    console.error('Error in sendNotificationToUser:', error)
    return { sent: 0, failed: 0 }
  }
}
