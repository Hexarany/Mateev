import express from 'express'
import { globalSearch, getSearchHistory, saveSearchQuery } from '../controllers/searchController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Глобальный поиск (доступен всем авторизованным пользователям)
router.get('/search', authenticateToken, globalSearch)

// История поиска пользователя
router.get('/search/history', authenticateToken, getSearchHistory)

// Сохранить запрос в историю
router.post('/search/history', authenticateToken, saveSearchQuery)

export default router
