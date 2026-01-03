import { Request, Response } from 'express'
import PDFDocument from 'pdfkit'
import MassageProtocol from '../models/MassageProtocol'
import TriggerPoint from '../models/TriggerPoint'
import HygieneGuideline from '../models/HygieneGuideline'
import Topic from '../models/Topic'
import {
  generateMassageProtocolsPdf,
  generateTriggerPointsPdf,
  generateHygieneGuidelinesPdf,
  generateTopicsPdf,
} from '../services/pdfExportService'
import { generatePdfFilename } from '../utils/pdfHelpers'

/**
 * Export Massage Protocols to PDF
 * POST /api/export/massage-protocols/pdf?language=ru&id={optional}
 */
export const exportMassageProtocolsPdf = async (req: Request, res: Response) => {
  try {
    const { language, id } = req.query

    // Validate language
    if (!language || (language !== 'ru' && language !== 'ro')) {
      return res.status(400).json({
        message: 'Language parameter is required and must be "ru" or "ro"',
      })
    }

    // Fetch data
    let protocols
    let slug = undefined

    if (id) {
      // Single protocol export
      const protocol = await MassageProtocol.findById(id)
      if (!protocol) {
        return res.status(404).json({ message: 'Massage protocol not found' })
      }
      protocols = [protocol]
      slug = protocol.slug
    } else {
      // Bulk export - all protocols
      protocols = await MassageProtocol.find().sort({ order: 1 })
    }

    if (protocols.length === 0) {
      return res.status(404).json({ message: 'No massage protocols found' })
    }

    // Generate filename
    const filename = generatePdfFilename('massage-protocols', language as 'ru' | 'ro', slug)

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: language === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj',
        Author: 'Anatomia Interactive',
        Subject: 'Massage Protocols Export',
        Keywords: 'massage, protocols, anatomia',
      },
    })

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    // Pipe PDF to response
    doc.pipe(res)

    // Generate PDF content
    await generateMassageProtocolsPdf(doc, protocols as any, language as 'ru' | 'ro')

    // Finalize PDF
    doc.end()
  } catch (error) {
    console.error('Error exporting massage protocols to PDF:', error)

    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to export massage protocols to PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

/**
 * Export Trigger Points to PDF
 * POST /api/export/trigger-points/pdf?language=ru&id={optional}
 */
export const exportTriggerPointsPdf = async (req: Request, res: Response) => {
  try {
    const { language, id } = req.query

    // Validate language
    if (!language || (language !== 'ru' && language !== 'ro')) {
      return res.status(400).json({
        message: 'Language parameter is required and must be "ru" or "ro"',
      })
    }

    // Fetch data
    let points
    let slug = undefined

    if (id) {
      // Single point export
      const point = await TriggerPoint.findById(id)
      if (!point) {
        return res.status(404).json({ message: 'Trigger point not found' })
      }
      points = [point]
      slug = point.slug
    } else {
      // Bulk export - all points
      points = await TriggerPoint.find({ isPublished: true }).sort({ category: 1, order: 1 })
    }

    if (points.length === 0) {
      return res.status(404).json({ message: 'No trigger points found' })
    }

    // Generate filename
    const filename = generatePdfFilename('trigger-points', language as 'ru' | 'ro', slug)

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: language === 'ru' ? 'Триггерные точки' : 'Puncte de declanșare',
        Author: 'Anatomia Interactive',
        Subject: 'Trigger Points Export',
        Keywords: 'trigger, points, massage, anatomia',
      },
    })

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    // Pipe PDF to response
    doc.pipe(res)

    // Generate PDF content
    await generateTriggerPointsPdf(doc, points as any, language as 'ru' | 'ro')

    // Finalize PDF
    doc.end()
  } catch (error) {
    console.error('Error exporting trigger points to PDF:', error)

    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to export trigger points to PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

/**
 * Export Hygiene Guidelines to PDF
 * POST /api/export/hygiene-guidelines/pdf?language=ru&id={optional}
 */
export const exportHygieneGuidelinesPdf = async (req: Request, res: Response) => {
  try {
    const { language, id } = req.query

    // Validate language
    if (!language || (language !== 'ru' && language !== 'ro')) {
      return res.status(400).json({
        message: 'Language parameter is required and must be "ru" or "ro"',
      })
    }

    // Fetch data
    let guidelines

    if (id) {
      // Single guideline export
      const guideline = await HygieneGuideline.findById(id)
      if (!guideline) {
        return res.status(404).json({ message: 'Hygiene guideline not found' })
      }
      guidelines = [guideline]
    } else {
      // Bulk export - all guidelines
      guidelines = await HygieneGuideline.find({ isPublished: true }).sort({ category: 1, order: 1 })
    }

    if (guidelines.length === 0) {
      return res.status(404).json({ message: 'No hygiene guidelines found' })
    }

    // Generate filename
    const slug = id ? `guideline-${id}` : undefined
    const filename = generatePdfFilename('hygiene-guidelines', language as 'ru' | 'ro', slug)

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: language === 'ru' ? 'Правила гигиены' : 'Reguli de igienă',
        Author: 'Anatomia Interactive',
        Subject: 'Hygiene Guidelines Export',
        Keywords: 'hygiene, guidelines, massage, anatomia',
      },
    })

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    // Pipe PDF to response
    doc.pipe(res)

    // Generate PDF content
    await generateHygieneGuidelinesPdf(doc, guidelines as any, language as 'ru' | 'ro')

    // Finalize PDF
    doc.end()
  } catch (error) {
    console.error('Error exporting hygiene guidelines to PDF:', error)

    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to export hygiene guidelines to PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

/**
 * Export Topics (Anatomy Themes) to PDF
 * POST /api/export/topics/pdf?language=ru&id={optional}
 */
export const exportTopicsPdf = async (req: Request, res: Response) => {
  try {
    const { language, id } = req.query

    // Validate language
    if (!language || (language !== 'ru' && language !== 'ro')) {
      return res.status(400).json({
        message: 'Language parameter is required and must be "ru" or "ro"',
      })
    }

    // Fetch data
    let topics
    let slug = undefined

    if (id) {
      // Single topic export
      const topic = await Topic.findById(id)
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' })
      }
      topics = [topic]
      slug = topic.slug
    } else {
      // Bulk export - all topics
      topics = await Topic.find().sort({ order: 1 })
    }

    if (topics.length === 0) {
      return res.status(404).json({ message: 'No topics found' })
    }

    // Generate filename
    const filename = generatePdfFilename('topics', language as 'ru' | 'ro', slug)

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: language === 'ru' ? 'Темы по анатомии' : 'Teme de anatomie',
        Author: 'Anatomia Interactive',
        Subject: 'Anatomy Topics Export',
        Keywords: 'anatomy, topics, anatomia',
      },
    })

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    // Pipe PDF to response
    doc.pipe(res)

    // Generate PDF content
    await generateTopicsPdf(doc, topics as any, language as 'ru' | 'ro')

    // Finalize PDF
    doc.end()
  } catch (error) {
    console.error('Error exporting topics to PDF:', error)

    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to export topics to PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
