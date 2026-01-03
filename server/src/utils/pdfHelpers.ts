import PDFDocument from 'pdfkit'
import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'

// Font paths
const FONTS_DIR = path.join(__dirname, '../../fonts')
export const FONT_PATHS = {
  regular: path.join(FONTS_DIR, 'DejaVuSans.ttf'),
  bold: path.join(FONTS_DIR, 'DejaVuSans-Bold.ttf'),
}

// PDF Style Constants
export const PDF_STYLES = {
  colors: {
    primary: '#1E88E5',
    secondary: '#00A087',
    text: '#333333',
    lightGray: '#999999',
    border: '#CCCCCC',
  },
  fonts: {
    regular: 'DejaVuSans',
    bold: 'DejaVuSans-Bold',
    italic: 'DejaVuSans',
  },
  sizes: {
    title: 22,
    heading: 18,
    subheading: 14,
    body: 11,
    caption: 9,
    footer: 8,
  },
  spacing: {
    margin: 50,
    sectionGap: 20,
    paragraphGap: 10,
    lineHeight: 1.5,
  },
  page: {
    width: 595.28, // A4 width in points
    height: 841.89, // A4 height in points
    maxImageWidth: 500,
  },
}

/**
 * Strip markdown formatting and convert to plain text
 */
export function stripMarkdown(text: string): string {
  if (!text) return ''

  return (
    text
      // Remove headers (##, ###, etc.)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic (**text**, *text*, __text__, _text_)
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove inline code `code`
      .replace(/`([^`]+)`/g, '$1')
      // Remove horizontal rules
      .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}

/**
 * Split text into lines that fit within a given width
 */
export function wrapText(
  doc: PDFKit.PDFDocument,
  text: string,
  width: number,
  fontSize: number
): string[] {
  doc.fontSize(fontSize)
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const lineWidth = doc.widthOfString(testLine)

    if (lineWidth > width) {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        // Word is longer than width, split it
        lines.push(word)
      }
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Register custom fonts with the PDF document
 */
export function registerFonts(doc: PDFKit.PDFDocument): void {
  try {
    // Check if font files exist
    const regularExists = require('fs').existsSync(FONT_PATHS.regular)
    const boldExists = require('fs').existsSync(FONT_PATHS.bold)

    if (!regularExists) {
      console.error(`Font file not found: ${FONT_PATHS.regular}`)
      throw new Error(`Font file not found: ${FONT_PATHS.regular}`)
    }

    if (!boldExists) {
      console.error(`Font file not found: ${FONT_PATHS.bold}`)
      throw new Error(`Font file not found: ${FONT_PATHS.bold}`)
    }

    console.log('Registering fonts:', { regular: FONT_PATHS.regular, bold: FONT_PATHS.bold })

    doc.registerFont('DejaVuSans', FONT_PATHS.regular)
    doc.registerFont('DejaVuSans-Bold', FONT_PATHS.bold)

    console.log('Fonts registered successfully')
  } catch (error) {
    console.error('Error registering fonts:', error)
    throw error
  }
}

/**
 * Add PDF header with title
 */
export function addPdfHeader(doc: PDFKit.PDFDocument, title: string): void {
  const { margin, sectionGap } = PDF_STYLES.spacing
  const { primary } = PDF_STYLES.colors
  const { title: titleSize } = PDF_STYLES.sizes
  const { bold } = PDF_STYLES.fonts

  doc
    .fontSize(titleSize)
    .font(bold)
    .fillColor(primary)
    .text('ANATOMIA INTERACTIVE', margin, margin, {
      align: 'center',
    })
    .moveDown(0.5)
    .fontSize(titleSize - 4)
    .text(title, {
      align: 'center',
    })
    .moveDown(1)

  // Add horizontal line
  doc
    .strokeColor(PDF_STYLES.colors.border)
    .lineWidth(1)
    .moveTo(margin, doc.y)
    .lineTo(PDF_STYLES.page.width - margin, doc.y)
    .stroke()

  doc.moveDown(1)
}

/**
 * Add section heading
 */
export function addSectionHeading(
  doc: PDFKit.PDFDocument,
  heading: string,
  level: 1 | 2 = 1
): void {
  const fontSize = level === 1 ? PDF_STYLES.sizes.heading : PDF_STYLES.sizes.subheading
  const color = level === 1 ? PDF_STYLES.colors.primary : PDF_STYLES.colors.text

  doc
    .fontSize(fontSize)
    .font(PDF_STYLES.fonts.bold)
    .fillColor(color)
    .text(heading)
    .moveDown(0.5)
    .fillColor(PDF_STYLES.colors.text)
    .font(PDF_STYLES.fonts.regular)
}

/**
 * Add body text with proper formatting
 */
export function addBodyText(doc: PDFKit.PDFDocument, text: string): void {
  if (!text) return

  const cleanText = stripMarkdown(text)
  const { margin } = PDF_STYLES.spacing
  const { body } = PDF_STYLES.sizes
  const maxWidth = PDF_STYLES.page.width - margin * 2

  doc.fontSize(body).font(PDF_STYLES.fonts.regular).text(cleanText, {
    width: maxWidth,
    align: 'left',
  })

  doc.moveDown(0.5)
}

/**
 * Add a separator line
 */
export function addSeparator(doc: PDFKit.PDFDocument, style: 'solid' | 'dashed' = 'solid'): void {
  const { margin } = PDF_STYLES.spacing

  doc.moveDown(0.5)

  if (style === 'dashed') {
    doc.strokeColor(PDF_STYLES.colors.lightGray).dash(5, { space: 3 })
  } else {
    doc.strokeColor(PDF_STYLES.colors.border).undash()
  }

  doc
    .lineWidth(1)
    .moveTo(margin, doc.y)
    .lineTo(PDF_STYLES.page.width - margin, doc.y)
    .stroke()

  doc.moveDown(0.5)
}

/**
 * Add page footer with page number
 */
export function addPageFooter(doc: PDFKit.PDFDocument): void {
  const { margin } = PDF_STYLES.spacing
  const { footer } = PDF_STYLES.sizes
  const { lightGray } = PDF_STYLES.colors
  const pageBottom = PDF_STYLES.page.height - margin

  // Calculate page number
  const range = doc.bufferedPageRange()
  const pageNumber = range.start + range.count

  doc
    .fontSize(footer)
    .fillColor(lightGray)
    .text(`Страница ${pageNumber}`, margin, pageBottom, {
      align: 'center',
      width: PDF_STYLES.page.width - margin * 2,
    })
}

/**
 * Fetch and prepare image for PDF embedding
 */
export async function fetchImageBuffer(imageUrl: string): Promise<Buffer | null> {
  try {
    // Check if URL is local or external
    if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
      // Local file
      const uploadsPath = path.join(process.cwd(), 'uploads')
      const cleanPath = imageUrl.replace(/^\//, '')
      const filePath = path.join(uploadsPath, cleanPath.replace('uploads/', ''))

      try {
        const buffer = await fs.readFile(filePath)
        return buffer
      } catch (err) {
        console.warn(`Failed to read local image: ${filePath}`, err)
        return null
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // External URL
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      })
      return Buffer.from(response.data)
    } else {
      console.warn(`Unsupported image URL format: ${imageUrl}`)
      return null
    }
  } catch (error) {
    console.error(`Error fetching image ${imageUrl}:`, error)
    return null
  }
}

/**
 * Add image to PDF with proper sizing
 */
export async function addImageToPdf(
  doc: PDFKit.PDFDocument,
  imageUrl: string,
  caption?: string
): Promise<void> {
  const imageBuffer = await fetchImageBuffer(imageUrl)

  if (!imageBuffer) {
    // Add placeholder text if image fails
    doc
      .fontSize(PDF_STYLES.sizes.caption)
      .fillColor(PDF_STYLES.colors.lightGray)
      .text(`[Image: ${imageUrl}]`)
      .moveDown(0.5)
    return
  }

  try {
    const { margin, maxImageWidth } = { ...PDF_STYLES.spacing, maxImageWidth: PDF_STYLES.page.maxImageWidth }
    const maxWidth = Math.min(maxImageWidth, PDF_STYLES.page.width - margin * 2)

    // Check if we need a new page
    if (doc.y > PDF_STYLES.page.height - 300) {
      doc.addPage()
    }

    doc.image(imageBuffer, {
      fit: [maxWidth, 400],
      align: 'center',
    })

    doc.moveDown(0.3)

    if (caption) {
      doc
        .fontSize(PDF_STYLES.sizes.caption)
        .fillColor(PDF_STYLES.colors.lightGray)
        .text(caption, {
          align: 'center',
        })
        .fillColor(PDF_STYLES.colors.text)
    }

    doc.moveDown(0.5)
  } catch (error) {
    console.error('Error adding image to PDF:', error)
    doc
      .fontSize(PDF_STYLES.sizes.caption)
      .fillColor(PDF_STYLES.colors.lightGray)
      .text(`[Image could not be loaded: ${imageUrl}]`)
      .moveDown(0.5)
  }
}

/**
 * Add metadata field (key: value)
 */
export function addMetadataField(doc: PDFKit.PDFDocument, key: string, value: string): void {
  doc
    .fontSize(PDF_STYLES.sizes.body)
    .font(PDF_STYLES.fonts.bold)
    .fillColor(PDF_STYLES.colors.text)
    .text(`${key}: `, {
      continued: true,
    })
    .font(PDF_STYLES.fonts.regular)
    .text(value)
    .moveDown(0.3)
}

/**
 * Start a new page if near bottom
 */
export function checkPageBreak(doc: PDFKit.PDFDocument, minSpace: number = 150): void {
  if (doc.y > PDF_STYLES.page.height - minSpace) {
    doc.addPage()
  }
}

/**
 * Format difficulty level for display
 */
export function formatDifficulty(difficulty: string, language: 'ru' | 'ro'): string {
  const difficulties: Record<string, { ru: string; ro: string }> = {
    beginner: { ru: 'Начальный', ro: 'Începător' },
    intermediate: { ru: 'Средний', ro: 'Intermediar' },
    advanced: { ru: 'Продвинутый', ro: 'Avansat' },
  }

  return difficulties[difficulty]?.[language] || difficulty
}

/**
 * Format category for display
 */
export function formatCategory(category: string, language: 'ru' | 'ro'): string {
  const categories: Record<string, { ru: string; ro: string }> = {
    // Trigger point categories
    head_neck: { ru: 'Голова и шея', ro: 'Cap și gât' },
    shoulder_arm: { ru: 'Плечо и рука', ro: 'Umăr și braț' },
    back: { ru: 'Спина', ro: 'Spate' },
    chest: { ru: 'Грудь', ro: 'Piept' },
    hip_leg: { ru: 'Бедро и нога', ro: 'Șold și picior' },
    other: { ru: 'Другое', ro: 'Altele' },

    // Hygiene categories
    introduction: { ru: 'Введение', ro: 'Introducere' },
    sterilization: { ru: 'Стерилизация', ro: 'Sterilizare' },
    disinfection: { ru: 'Дезинфекция', ro: 'Dezinfecție' },
    ergonomics: { ru: 'Эргономика', ro: 'Ergonomie' },
    office_requirements: { ru: 'Требования к кабинету', ro: 'Cerințe pentru cabinet' },
    therapist_requirements: { ru: 'Требования к массажисту', ro: 'Cerințe pentru terapeut' },
    dress_code: { ru: 'Дресс-код', ro: 'Cod vestimentar' },

    // Anatomy 3D categories
    bones: { ru: 'Кости', ro: 'Oase' },
    muscles: { ru: 'Мышцы', ro: 'Mușchi' },
    organs: { ru: 'Органы', ro: 'Organe' },
    nervous_system: { ru: 'Нервная система', ro: 'Sistem nervos' },
    cardiovascular_system: { ru: 'Сердечно-сосудистая система', ro: 'Sistem cardiovascular' },
  }

  return categories[category]?.[language] || category
}

/**
 * Generate filename for PDF export
 */
export function generatePdfFilename(
  entityType: string,
  language: 'ru' | 'ro',
  slug?: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const sanitizedSlug = slug ? slug.replace(/[^a-z0-9-]/gi, '-') : 'all'

  return `${entityType}-${sanitizedSlug}-${language}-${timestamp}.pdf`
}
