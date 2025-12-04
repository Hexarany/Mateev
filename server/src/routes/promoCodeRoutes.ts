import express from 'express'
import {
  getAllPromoCodes,
  createPromoCode,
  validatePromoCode,
  applyPromoCode,
  updatePromoCode,
  deletePromoCode,
  getPromoCodeStats,
} from '../controllers/promoCodeController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// Public routes (с аутентификацией)
router.get('/validate/:code', authenticateToken, validatePromoCode)
router.post('/apply', authenticateToken, applyPromoCode)

// Admin-only routes
router.get('/', authenticateToken, authorizeRole('admin'), getAllPromoCodes)
router.post('/', authenticateToken, authorizeRole('admin'), createPromoCode)
router.put('/:id', authenticateToken, authorizeRole('admin'), updatePromoCode)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deletePromoCode)
router.get('/:id/stats', authenticateToken, authorizeRole('admin'), getPromoCodeStats)

export default router
