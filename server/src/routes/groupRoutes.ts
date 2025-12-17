import express from 'express'
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addStudentToGroup,
  removeStudentFromGroup
} from '../controllers/groupController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// Admin + Teacher могут создавать группы
router.post('/', authenticateToken, authorizeRole('admin', 'teacher'), createGroup)

// Admin + Teacher могут просматривать группы (teacher видит только свои)
router.get('/', authenticateToken, authorizeRole('admin', 'teacher'), getAllGroups)

// Просмотр конкретной группы
router.get('/:id', authenticateToken, authorizeRole('admin', 'teacher'), getGroupById)

// Обновление группы (только admin или teacher-владелец)
router.put('/:id', authenticateToken, authorizeRole('admin', 'teacher'), updateGroup)

// Удаление группы (только admin)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteGroup)

// Добавление студента в группу
router.post('/:id/students', authenticateToken, authorizeRole('admin', 'teacher'), addStudentToGroup)

// Удаление студента из группы
router.delete('/:id/students/:studentId', authenticateToken, authorizeRole('admin', 'teacher'), removeStudentFromGroup)

export default router
