import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

interface Message {
  _id: string
  conversationId: string
  sender: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  content: string
  type: 'text' | 'image' | 'file'
  attachments?: any[]
  readBy: string[]
  createdAt: string
  updatedAt: string
}

interface SocketEvents {
  'message:new': (data: { message: Message; conversationId: string }) => void
  'message:read': (data: { conversationId: string; messageIds: string[]; userId: string }) => void
  'typing:start': (data: { conversationId: string; userId: string }) => void
  'typing:stop': (data: { conversationId: string; userId: string }) => void
  'user:online': (userIds: string[]) => void
  'user:offline': (userId: string) => void
  error: (data: { message: string }) => void
}

export const useSocket = () => {
  const { token } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    if (!token) {
      // Если нет токена, отключаемся
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
      return
    }

    // Создаем соединение
    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    // Обработчики соединения
    socket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      setIsConnected(false)
    })

    // Обработчики онлайн статуса
    socket.on('user:online', (userIds: string[]) => {
      setOnlineUsers(userIds)
    })

    socket.on('user:offline', (userId: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    })

    // Cleanup при размонтировании
    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [token])

  // Присоединиться к беседе
  const joinConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('conversation:join', conversationId)
    }
  }

  // Покинуть беседу
  const leaveConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('conversation:leave', conversationId)
    }
  }

  // Отправить сообщение
  const sendMessage = (data: {
    conversationId: string
    content: string
    type?: 'text' | 'image' | 'file'
    attachments?: any[]
  }) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message:send', data)
    }
  }

  // Отметить сообщения как прочитанные
  const markMessagesAsRead = (conversationId: string, messageIds: string[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message:read', { conversationId, messageIds })
    }
  }

  // Начать печатать
  const startTyping = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing:start', conversationId)
    }
  }

  // Закончить печатать
  const stopTyping = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing:stop', conversationId)
    }
  }

  // Подписаться на событие
  const on = <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback as any)
    }
  }

  // Отписаться от события
  const off = <K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback as any)
      } else {
        socketRef.current.off(event)
      }
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    on,
    off,
  }
}
