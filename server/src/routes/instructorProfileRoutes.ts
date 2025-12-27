import express from 'express'
import {
  getInstructorProfile,
  getInstructorProfileForAdmin,
  createOrUpdateInstructorProfile,
  deleteInstructorProfile,
} from '../controllers/instructorProfileController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// Public route - get active instructor profile
router.get('/', getInstructorProfile)

// Admin routes - require authentication and admin/teacher role
router.get('/admin', authenticateToken, authorizeRole('admin', 'teacher'), getInstructorProfileForAdmin)
router.post('/', authenticateToken, authorizeRole('admin', 'teacher'), createOrUpdateInstructorProfile)
router.delete('/', authenticateToken, authorizeRole('admin'), deleteInstructorProfile)

export default router
