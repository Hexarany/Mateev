import express from 'express'
import { getLogs, getStats, getFilters } from '../controllers/auditLogController'
import { protect, admin } from '../middleware/auth'

const router = express.Router()

// Все роуты требуют аутентификации и прав админа
router.use(protect)
router.use(admin)

// GET /api/audit-logs - получить логи с фильтрацией
router.get('/', getLogs)

// GET /api/audit-logs/stats - получить статистику
router.get('/stats', getStats)

// GET /api/audit-logs/filters - получить доступные фильтры
router.get('/filters', getFilters)

export default router
