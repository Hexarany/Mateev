import AuditLog, { IAuditLog } from '../models/AuditLog'
import { Request } from 'express'

interface LogOptions {
  userId?: string
  userEmail?: string
  action: string
  entityType: string
  entityId?: string
  changes?: any // Can be either object or array of changes
  req?: Request
  status?: 'success' | 'failure'
  errorMessage?: string
}

/**
 * Создать запись в audit log
 */
export const createAuditLog = async (options: LogOptions): Promise<void> => {
  try {
    const metadata: any = {}

    if (options.req) {
      metadata.ip = options.req.ip || options.req.socket.remoteAddress
      metadata.userAgent = options.req.get('user-agent')
      metadata.method = options.req.method
      metadata.url = options.req.originalUrl
    }

    await AuditLog.create({
      userId: options.userId || null,
      userEmail: options.userEmail,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      changes: options.changes,
      metadata,
      status: options.status || 'success',
      errorMessage: options.errorMessage,
      timestamp: new Date(),
    })
  } catch (error) {
    // Не бросаем ошибку, чтобы не ломать основной функционал
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Получить логи с фильтрацией и пагинацией
 */
export const getAuditLogs = async (filters: {
  userId?: string
  action?: string
  entityType?: string
  entityId?: string
  startDate?: Date
  endDate?: Date
  status?: 'success' | 'failure'
  page?: number
  limit?: number
}) => {
  const query: any = {}

  if (filters.userId) query.userId = filters.userId
  if (filters.action) query.action = filters.action
  if (filters.entityType) query.entityType = filters.entityType
  if (filters.entityId) query.entityId = filters.entityId
  if (filters.status) query.status = filters.status

  if (filters.startDate || filters.endDate) {
    query.timestamp = {}
    if (filters.startDate) query.timestamp.$gte = filters.startDate
    if (filters.endDate) query.timestamp.$lte = filters.endDate
  }

  const page = filters.page || 1
  const limit = filters.limit || 50
  const skip = (page - 1) * limit

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email firstName lastName')
      .lean(),
    AuditLog.countDocuments(query),
  ])

  return {
    logs,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

/**
 * Получить статистику по логам
 */
export const getAuditLogStats = async (days: number = 7) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const stats = await AuditLog.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: {
          action: '$action',
          entityType: '$entityType',
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])

  const totalLogs = await AuditLog.countDocuments({
    timestamp: { $gte: startDate },
  })

  const failedLogs = await AuditLog.countDocuments({
    timestamp: { $gte: startDate },
    status: 'failure',
  })

  return {
    totalLogs,
    failedLogs,
    successRate: totalLogs > 0 ? ((totalLogs - failedLogs) / totalLogs) * 100 : 100,
    actionStats: stats,
  }
}

/**
 * Очистить старые логи (для оптимизации)
 */
export const cleanupOldLogs = async (daysToKeep: number = 90) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const result = await AuditLog.deleteMany({
    timestamp: { $lt: cutoffDate },
  })

  return {
    deletedCount: result.deletedCount,
  }
}
