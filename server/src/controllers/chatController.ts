import { Request, Response } from 'express'
import Conversation from '../models/Conversation'
import Message from '../models/Message'
import User from '../models/User'
import mongoose from 'mongoose'

// Получить все беседы пользователя
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.userId

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'firstName lastName email accessLevel')
      .populate('lastMessage.sender', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .lean()

    // Преобразуем unreadCount из Map в объект
    const conversationsWithUnread = conversations.map((conv: any) => ({
      ...conv,
      unreadCount: conv.unreadCount ? Object.fromEntries(conv.unreadCount) : {},
    }))

    res.json(conversationsWithUnread)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ message: 'Ошибка получения бесед' })
  }
}

// Получить беседу по ID
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params
    const userId = req.userId

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })
      .populate('participants', 'firstName lastName email accessLevel')
      .populate('lastMessage.sender', 'firstName lastName')
      .lean()

    if (!conversation) {
      return res.status(404).json({ message: 'Беседа не найдена' })
    }

    // Преобразуем unreadCount из Map в объект
    const conversationWithUnread = {
      ...conversation,
      unreadCount: (conversation as any).unreadCount
        ? Object.fromEntries((conversation as any).unreadCount)
        : {},
    }

    res.json(conversationWithUnread)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    res.status(500).json({ message: 'Ошибка получения беседы' })
  }
}

// Создать или получить приватную беседу с пользователем
export const createOrGetPrivateConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const { otherUserId } = req.body

    if (!otherUserId) {
      return res.status(400).json({ message: 'otherUserId is required' })
    }

    if (userId === otherUserId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' })
    }

    // Проверяем существование другого пользователя
    const otherUser = await User.findById(otherUserId)
    if (!otherUser) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // Проверяем, есть ли уже приватная беседа между этими пользователями
    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [userId, otherUserId], $size: 2 },
    })
      .populate('participants', 'firstName lastName email accessLevel')
      .populate('lastMessage.sender', 'firstName lastName')

    // Если беседы нет, создаем новую
    if (!conversation) {
      conversation = await Conversation.create({
        type: 'private',
        participants: [userId, otherUserId],
        unreadCount: new Map([
          [userId, 0],
          [otherUserId, 0],
        ]),
      })

      await conversation.populate('participants', 'firstName lastName email accessLevel')
    }

    const conversationObj = conversation.toObject()
    const conversationWithUnread = {
      ...conversationObj,
      unreadCount: conversationObj.unreadCount
        ? Object.fromEntries(conversationObj.unreadCount)
        : {},
    }

    res.json(conversationWithUnread)
  } catch (error) {
    console.error('Error creating conversation:', error)
    res.status(500).json({ message: 'Ошибка создания беседы' })
  }
}

// Создать групповую беседу
export const createGroupConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const { participantIds, name, avatar } = req.body

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return res.status(400).json({ message: 'Минимум 2 участника требуются для группы' })
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Название группы обязательно' })
    }

    // Добавляем создателя в участники, если его нет
    const allParticipants = [...new Set([userId, ...participantIds])]

    // Проверяем, что все участники существуют
    const users = await User.find({ _id: { $in: allParticipants } })
    if (users.length !== allParticipants.length) {
      return res.status(400).json({ message: 'Некоторые пользователи не найдены' })
    }

    // Создаем unreadCount Map для всех участников
    const unreadCountMap = new Map()
    allParticipants.forEach((id) => unreadCountMap.set(id, 0))

    const conversation = await Conversation.create({
      type: 'group',
      participants: allParticipants,
      name: name.trim(),
      avatar,
      createdBy: userId,
      unreadCount: unreadCountMap,
    })

    await conversation.populate('participants', 'firstName lastName email accessLevel')

    const conversationObj = conversation.toObject()
    const conversationWithUnread = {
      ...conversationObj,
      unreadCount: conversationObj.unreadCount
        ? Object.fromEntries(conversationObj.unreadCount)
        : {},
    }

    res.json(conversationWithUnread)
  } catch (error) {
    console.error('Error creating group conversation:', error)
    res.status(500).json({ message: 'Ошибка создания группы' })
  }
}

// Получить сообщения в беседе
export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params
    const userId = req.userId
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50

    // Проверяем доступ к беседе
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })

    if (!conversation) {
      return res.status(404).json({ message: 'Беседа не найдена' })
    }

    // Получаем сообщения с пагинацией
    const messages = await Message.find({ conversationId })
      .populate('sender', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const totalMessages = await Message.countDocuments({ conversationId })

    res.json({
      messages: messages.reverse(), // Обратный порядок для отображения
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ message: 'Ошибка получения сообщений' })
  }
}

// Удалить беседу (только для создателя группы или участников приватной беседы)
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params
    const userId = req.userId

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      return res.status(404).json({ message: 'Беседа не найдена' })
    }

    // Проверяем права: для группы - только создатель, для приватной - любой участник
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    )

    if (!isParticipant) {
      return res.status(403).json({ message: 'Нет доступа к этой беседе' })
    }

    if (
      conversation.type === 'group' &&
      conversation.createdBy?.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: 'Только создатель может удалить группу' })
    }

    // Удаляем все сообщения беседы
    await Message.deleteMany({ conversationId })

    // Удаляем беседу
    await conversation.deleteOne()

    res.json({ message: 'Беседа удалена' })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    res.status(500).json({ message: 'Ошибка удаления беседы' })
  }
}

// Поиск пользователей для начала беседы
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const { query } = req.query

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ message: 'Поисковый запрос обязателен' })
    }

    const searchRegex = new RegExp(query.trim(), 'i')

    const users = await User.find({
      _id: { $ne: userId }, // Исключаем текущего пользователя
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ],
      // Только Basic и Premium могут использовать чат
      $or: [
        { accessLevel: { $in: ['basic', 'premium'] } },
        { role: { $in: ['admin', 'teacher'] } },
      ],
    })
      .select('firstName lastName email accessLevel role')
      .limit(20)
      .lean()

    res.json(users)
  } catch (error) {
    console.error('Error searching users:', error)
    res.status(500).json({ message: 'Ошибка поиска пользователей' })
  }
}
