import express from 'express'
import { authenticateToken, authorizeRole } from '../middleware/auth'
import {
  searchImages,
  searchArticles,
  getArticle,
  searchMedicalLiterature,
  importTopicFromWikipedia,
  translateText,
} from '../controllers/externalImportController'

const router = express.Router()

// All routes require authentication and teacher/admin role
router.use(authenticateToken, authorizeRole('teacher', 'admin'))

/**
 * @route   GET /api/external-import/images
 * @desc    Search Wikimedia Commons for medical images
 * @access  Teacher/Admin
 */
router.get('/images', searchImages)

/**
 * @route   GET /api/external-import/articles
 * @desc    Search Wikipedia articles
 * @access  Teacher/Admin
 */
router.get('/articles', searchArticles)

/**
 * @route   GET /api/external-import/article
 * @desc    Get full Wikipedia article content
 * @access  Teacher/Admin
 */
router.get('/article', getArticle)

/**
 * @route   GET /api/external-import/medical-literature
 * @desc    Search PubMed for medical literature
 * @access  Teacher/Admin
 */
router.get('/medical-literature', searchMedicalLiterature)

/**
 * @route   POST /api/external-import/topic
 * @desc    Import topic from Wikipedia and create in database
 * @access  Teacher/Admin
 */
router.post('/topic', importTopicFromWikipedia)

/**
 * @route   POST /api/external-import/translate
 * @desc    Translate text using Claude
 * @access  Teacher/Admin
 */
router.post('/translate', translateText)

export default router
