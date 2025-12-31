import express from 'express'
import {
  exportUsersToCSV,
  importUsersFromCSV,
  bulkDeleteUsers,
  bulkUpdateUserRoles,
  bulkAddUsersToGroup,
  bulkUploadGrades,
} from '../controllers/bulkOperationsController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// All routes require admin or teacher authorization
router.use(authenticateToken)

// Users bulk operations
router.get('/users/export', authorizeRole('admin', 'teacher'), exportUsersToCSV)
router.post('/users/import', authorizeRole('admin'), importUsersFromCSV)
router.post('/users/delete', authorizeRole('admin'), bulkDeleteUsers)
router.post('/users/update-roles', authorizeRole('admin'), bulkUpdateUserRoles)
router.post('/users/add-to-group', authorizeRole('admin', 'teacher'), bulkAddUsersToGroup)

// Grades bulk operations
router.post('/grades/upload', authorizeRole('admin', 'teacher'), bulkUploadGrades)

export default router
