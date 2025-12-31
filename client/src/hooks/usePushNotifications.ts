import { useState, useEffect } from 'react'
import api from '@/services/api'

interface PushSubscriptionState {
  isSubscribed: boolean
  isSupported: boolean
  permission: NotificationPermission
  error: string | null
}

/**
 * Hook to manage push notification subscriptions
 *
 * Features:
 * - Check browser support
 * - Request permission
 * - Subscribe/unsubscribe
 * - Track subscription state
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushSubscriptionState>({
    isSubscribed: false,
    isSupported: false,
    permission: 'default',
    error: null,
  })

  // Check if browser supports push notifications
  useEffect(() => {
    const isSupported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setState((prev) => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied',
    }))

    if (isSupported) {
      checkSubscription()
    }
  }, [])

  /**
   * Check if user is already subscribed
   */
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      setState((prev) => ({
        ...prev,
        isSubscribed: subscription !== null,
      }))
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  /**
   * Subscribe to push notifications
   */
  const subscribe = async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, error: null }))

      // Request notification permission
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        setState((prev) => ({
          ...prev,
          permission,
          error: 'Notification permission denied',
        }))
        return false
      }

      setState((prev) => ({ ...prev, permission }))

      // Get VAPID public key from server
      const { data } = await api.get<{ publicKey: string }>(
        '/push-notifications/vapid-public-key'
      )

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      })

      // Send subscription to server
      await api.post('/push-notifications/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      })

      setState((prev) => ({ ...prev, isSubscribed: true }))
      return true
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error)
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to subscribe',
      }))
      return false
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, error: null }))

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        setState((prev) => ({ ...prev, isSubscribed: false }))
        return true
      }

      // Unsubscribe from browser
      await subscription.unsubscribe()

      // Remove from server
      await api.post('/push-notifications/unsubscribe', {
        endpoint: subscription.endpoint,
      })

      setState((prev) => ({ ...prev, isSubscribed: false }))
      return true
    } catch (error: any) {
      console.error('Error unsubscribing from push notifications:', error)
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to unsubscribe',
      }))
      return false
    }
  }

  return {
    ...state,
    subscribe,
    unsubscribe,
    checkSubscription,
  }
}

/**
 * Convert VAPID public key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}
