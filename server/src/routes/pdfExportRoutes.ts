import express from 'express'
import {
  exportMassageProtocolsPdf,
  exportTriggerPointsPdf,
  exportHygieneGuidelinesPdf,
  exportTopicsPdf,
} from '../controllers/pdfExportController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// ADMIN ONLY: PDF Export endpoints
// All export endpoints require admin authentication

/**
 * Export Massage Protocols to PDF
 * POST /api/export/massage-protocols/pdf?language=ru&id={optional}
 */
router.post(
  '/massage-protocols/pdf',
  authenticateToken,
  authorizeRole('admin'),
  exportMassageProtocolsPdf
)

/**
 * Export Trigger Points to PDF
 * POST /api/export/trigger-points/pdf?language=ru&id={optional}
 */
router.post(
  '/trigger-points/pdf',
  authenticateToken,
  authorizeRole('admin'),
  exportTriggerPointsPdf
)

/**
 * Export Hygiene Guidelines to PDF
 * POST /api/export/hygiene-guidelines/pdf?language=ru&id={optional}
 */
router.post(
  '/hygiene-guidelines/pdf',
  authenticateToken,
  authorizeRole('admin'),
  exportHygieneGuidelinesPdf
)

/**
 * Export Topics (Anatomy Themes) to PDF
 * POST /api/export/topics/pdf?language=ru&id={optional}
 */
router.post(
  '/topics/pdf',
  authenticateToken,
  authorizeRole('admin'),
  exportTopicsPdf
)

export default router
