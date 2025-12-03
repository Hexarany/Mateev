import express from 'express'
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  incrementDownloads,
  getResourceCategories,
  getResourceTags,
} from '../controllers/resourceController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Публичные роуты (доступны всем авторизованным пользователям)
router.get('/resources', authenticateToken, getResources)
router.get('/resources/categories', authenticateToken, getResourceCategories)
router.get('/resources/tags', authenticateToken, getResourceTags)
router.get('/resources/:resourceId', authenticateToken, getResourceById)
router.post('/resources/:resourceId/download', authenticateToken, incrementDownloads)

// Защищенные роуты (только admin/teacher)
const checkAdminOrTeacher = (req: any, res: any, next: any) => {
  if (req.user?.role === 'admin' || req.user?.role === 'teacher') {
    return next()
  }
  return res.status(403).json({ message: 'Access denied: Admin or Teacher role required' })
}

router.post('/resources', authenticateToken, checkAdminOrTeacher, createResource)
router.put('/resources/:resourceId', authenticateToken, checkAdminOrTeacher, updateResource)
router.delete('/resources/:resourceId', authenticateToken, checkAdminOrTeacher, deleteResource)

export default router
