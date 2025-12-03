import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import Message from '../models/Message'
import Conversation from '../models/Conversation'
import User from '../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Хранилище онлайн пользователей: userId -> socketId
const onlineUsers = new Map<string, string>()

// Хранилище пользователей которые печатают: conversationId -> Set<userId>
const typingUsers = new Map<string, Set<string>>()

export const initializeChatSocket = (io: Server) => {
  // Middleware для аутентификации
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      // Проверяем токен
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      const user = await User.findById(decoded.userId)

      if (!user) {
        return next(new Error('Authentication error: User not found'))
      }

      // Проверяем уровень доступа (Basic или Premium)
      if (user.accessLevel === 'free' && user.role !== 'admin' && user.role !== 'teacher') {
        return next(new Error('Access denied: Chat is available for Basic and Premium users only'))
      }

      // Сохраняем пользователя в сокете
      socket.data.userId = String(user._id)
      socket.data.user = user

      next()
    } catch (error) {
      console.error('Socket authentication error:', error)
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId
    console.log(`User connected: ${userId}`)

    // Добавляем пользователя в онлайн
    onlineUsers.set(userId, socket.id)

    // Отправляем список онлайн пользователей всем
    io.emit('user:online', Array.from(onlineUsers.keys()))

    // Присоединяем пользователя к его комнатам (беседам)
    socket.on('conversation:join', async (conversationId: string) => {
      try {
        // Проверяем, что пользователь является участником беседы
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        })

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found or access denied' })
          return
        }

        socket.join(conversationId)
        console.log(`User ${userId} joined conversation ${conversationId}`)
      } catch (error) {
        console.error('Error joining conversation:', error)
        socket.emit('error', { message: 'Failed to join conversation' })
      }
    })

    // Покинуть беседу
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(conversationId)
      console.log(`User ${userId} left conversation ${conversationId}`)
    })

    // Отправка сообщения
    socket.on('message:send', async (data: {
      conversationId: string
      content: string
      type?: 'text' | 'image' | 'file'
      attachments?: any[]
    }) => {
      try {
        const { conversationId, content, type = 'text', attachments } = data

        // Проверяем доступ к беседе
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        })

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found or access denied' })
          return
        }

        // Создаем сообщение
        const message = await Message.create({
          conversationId,
          sender: userId,
          content,
          type,
          attachments,
          readBy: [userId], // Отправитель уже прочитал
        })

        // Заполняем данные отправителя
        await message.populate('sender', 'firstName lastName email')

        // Обновляем последнее сообщение в беседе
        conversation.lastMessage = {
          content,
          sender: userId as any,
          timestamp: new Date(),
        }

        // Обновляем счетчик непрочитанных для других участников
        conversation.participants.forEach((participantId) => {
          const participantIdStr = participantId.toString()
          if (participantIdStr !== userId) {
            const currentCount = conversation.unreadCount.get(participantIdStr) || 0
            conversation.unreadCount.set(participantIdStr, currentCount + 1)
          }
        })

        await conversation.save()

        // Отправляем сообщение всем участникам беседы
        io.to(conversationId).emit('message:new', {
          message,
          conversationId,
        })

        // Отправляем уведомление о новом сообщении офлайн пользователям
        conversation.participants.forEach((participantId) => {
          const participantIdStr = participantId.toString()
          if (participantIdStr !== userId && !onlineUsers.has(participantIdStr)) {
            // Здесь можно добавить отправку push-уведомления
            console.log(`Send notification to offline user: ${participantIdStr}`)
          }
        })
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Отметка сообщений как прочитанных
    socket.on('message:read', async (data: { conversationId: string; messageIds: string[] }) => {
      try {
        const { conversationId, messageIds } = data

        // Проверяем доступ
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        })

        if (!conversation) {
          return
        }

        // Обновляем сообщения
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            conversationId,
            readBy: { $ne: userId },
          },
          {
            $addToSet: { readBy: userId },
          }
        )

        // Сбрасываем счетчик непрочитанных
        conversation.unreadCount.set(userId, 0)
        await conversation.save()

        // Уведомляем других участников
        io.to(conversationId).emit('message:read', {
          conversationId,
          messageIds,
          userId,
        })
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    })

    // Индикатор печати
    socket.on('typing:start', (conversationId: string) => {
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set())
      }
      typingUsers.get(conversationId)!.add(userId)

      socket.to(conversationId).emit('typing:start', {
        conversationId,
        userId,
      })
    })

    socket.on('typing:stop', (conversationId: string) => {
      typingUsers.get(conversationId)?.delete(userId)

      socket.to(conversationId).emit('typing:stop', {
        conversationId,
        userId,
      })
    })

    // Отключение
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`)

      // Удаляем из онлайн
      onlineUsers.delete(userId)

      // Удаляем из индикаторов печати
      typingUsers.forEach((users, conversationId) => {
        if (users.has(userId)) {
          users.delete(userId)
          io.to(conversationId).emit('typing:stop', {
            conversationId,
            userId,
          })
        }
      })

      // Уведомляем всех об оффлайне
      io.emit('user:offline', userId)
    })
  })

  console.log('Chat socket server initialized')
}

export { onlineUsers }
