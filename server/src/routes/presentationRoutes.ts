// server/src/routes/presentationRoutes.ts

import express from 'express'
import {
  getPresentations,
  getPresentationById,
  createPresentation,
  updatePresentation,
  deletePresentation,
  downloadPresentation,
} from '../controllers/presentationController'
import { authenticateToken, authorizeRole } from '../middleware/auth' // <-- ИСПРАВЛЕННЫЕ ИМПОРТЫ
import multer from 'multer'

// Конфигурация Multer для обработки входящего файла (используем memoryStorage для Mock-логики)
const storage = multer.memoryStorage() 
const upload = multer({ storage })

const router = express.Router()

// PUBLIC: Чтение и скачивание
router.get('/', getPresentations)
router.get('/:id', getPresentationById)
router.get('/download/:id', downloadPresentation) 

// ADMIN ONLY: CRUD
// Создание: Требует файл ('file') в FormData
router.post(
  '/',
  authenticateToken,
  authorizeRole('admin', 'teacher'),
  upload.single('file'), 
  createPresentation
)

// Обновление: Может содержать новый файл
router.put(
  '/:id',
  authenticateToken,
  authorizeRole('admin', 'teacher'),
  upload.single('file'),
  updatePresentation
)

// Удаление
router.delete('/:id', authenticateToken, authorizeRole('admin'), deletePresentation)

export default router