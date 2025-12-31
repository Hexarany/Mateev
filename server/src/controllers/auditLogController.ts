import { Request, Response } from 'express'
import { getAuditLogs, getAuditLogStats } from '../services/auditLogService'

/**
 * Получить audit logs с фильтрацией
 * GET /api/audit-logs
 */
export const getLogs = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      status,
      page,
      limit,
    } = req.query

    const filters: any = {}

    if (userId) filters.userId = userId as string
    if (action) filters.action = action as string
    if (entityType) filters.entityType = entityType as string
    if (entityId) filters.entityId = entityId as string
    if (status) filters.status = status as 'success' | 'failure'
    if (page) filters.page = parseInt(page as string)
    if (limit) filters.limit = parseInt(limit as string)

    if (startDate) filters.startDate = new Date(startDate as string)
    if (endDate) filters.endDate = new Date(endDate as string)

    const result = await getAuditLogs(filters)

    res.json(result)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    res.status(500).json({ message: 'Ошибка при получении логов' })
  }
}

/**
 * Получить статистику по логам
 * GET /api/audit-logs/stats
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7

    const stats = await getAuditLogStats(days)

    res.json(stats)
  } catch (error) {
    console.error('Error fetching audit log stats:', error)
    res.status(500).json({ message: 'Ошибка при получении статистики логов' })
  }
}

/**
 * Получить доступные типы действий и сущностей для фильтров
 * GET /api/audit-logs/filters
 */
export const getFilters = async (req: Request, res: Response) => {
  try {
    const actions = await getAuditLogs({})
      .then(result => [...new Set(result.logs.map((log: any) => log.action))])

    const entityTypes = await getAuditLogs({})
      .then(result => [...new Set(result.logs.map((log: any) => log.entityType))])

    res.json({
      actions: actions.sort(),
      entityTypes: entityTypes.sort(),
    })
  } catch (error) {
    console.error('Error fetching filter options:', error)
    res.status(500).json({ message: 'Ошибка при получении фильтров' })
  }
}
