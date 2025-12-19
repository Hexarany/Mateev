import express from 'express'
import {
  sendFileToGroup,
  getGroupFiles,
  getGroupFileById,
  retryFailedDeliveries,
  deleteGroupFile,
  getGroupDeliveryStats,
} from '../controllers/groupFileController'
import { protect } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/roleMiddleware'

const router = express.Router()

// Все роуты требуют авторизации
router.use(protect)

/**
 * POST /api/group-files/send
 * Отправить файл группе (teacher, admin)
 * Body: { groupId, mediaId, title?, description? }
 */
router.post(
  '/send',
  requireRole(['teacher', 'admin']),
  sendFileToGroup
)

/**
 * GET /api/group-files/group/:groupId
 * Получить все файлы группы (students видят только свои статусы)
 */
router.get('/group/:groupId', getGroupFiles)

/**
 * GET /api/group-files/group/:groupId/stats
 * Получить статистику доставки для группы (teacher, admin)
 */
router.get(
  '/group/:groupId/stats',
  requireRole(['teacher', 'admin']),
  getGroupDeliveryStats
)

/**
 * GET /api/group-files/:id
 * Получить детали конкретного файла
 */
router.get('/:id', getGroupFileById)

/**
 * POST /api/group-files/:id/retry
 * Повторить отправку неудачных доставок (teacher, admin)
 */
router.post(
  '/:id/retry',
  requireRole(['teacher', 'admin']),
  retryFailedDeliveries
)

/**
 * DELETE /api/group-files/:id
 * Удалить файл группы (teacher, admin)
 */
router.delete(
  '/:id',
  requireRole(['teacher', 'admin']),
  deleteGroupFile
)

export default router
