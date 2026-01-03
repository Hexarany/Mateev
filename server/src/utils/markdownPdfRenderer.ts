import PDFDocument from 'pdfkit'
import { marked, Token, Tokens } from 'marked'
import { PDF_STYLES, fetchImageBuffer } from './pdfHelpers'

/**
 * Render markdown content to PDF with full formatting support
 * Supports: headers, bold, italic, lists, tables, images, links
 */
export async function renderMarkdownToPdf(
  doc: PDFKit.PDFDocument,
  markdown: string,
  options: { maxWidth?: number } = {}
): Promise<void> {
  if (!markdown) return

  const maxWidth = options.maxWidth || PDF_STYLES.page.width - PDF_STYLES.spacing.margin * 2

  // Parse markdown to tokens
  const tokens = marked.lexer(markdown)

  // Render each token
  for (const token of tokens) {
    await renderToken(doc, token, maxWidth)
  }
}

/**
 * Render a single markdown token
 */
async function renderToken(
  doc: PDFKit.PDFDocument,
  token: Token,
  maxWidth: number
): Promise<void> {
  switch (token.type) {
    case 'heading':
      renderHeading(doc, token as Tokens.Heading, maxWidth)
      break

    case 'paragraph':
      await renderParagraph(doc, token as Tokens.Paragraph, maxWidth)
      break

    case 'list':
      await renderList(doc, token as Tokens.List, maxWidth)
      break

    case 'table':
      await renderTable(doc, token as Tokens.Table, maxWidth)
      break

    case 'space':
      doc.moveDown(0.5)
      break

    case 'hr':
      renderHorizontalRule(doc, maxWidth)
      break

    case 'blockquote':
      await renderBlockquote(doc, token as Tokens.Blockquote, maxWidth)
      break

    case 'code':
      renderCodeBlock(doc, token as Tokens.Code, maxWidth)
      break

    default:
      // Handle any other token types as plain text
      if ('text' in token && token.text) {
        doc.fontSize(PDF_STYLES.sizes.body).font(PDF_STYLES.fonts.regular).text(token.text, {
          width: maxWidth,
          align: 'left',
        })
        doc.moveDown(0.5)
      }
      break
  }
}

/**
 * Render heading (h1, h2, h3, etc.)
 */
function renderHeading(
  doc: PDFKit.PDFDocument,
  token: Tokens.Heading,
  maxWidth: number
): void {
  const sizes = [22, 18, 16, 14, 12, 11] // h1-h6
  const fontSize = sizes[token.depth - 1] || PDF_STYLES.sizes.body

  doc.moveDown(0.5)
  doc
    .fontSize(fontSize)
    .font(PDF_STYLES.fonts.bold)
    .fillColor(PDF_STYLES.colors.primary)
    .text(token.text, {
      width: maxWidth,
      align: 'left',
    })
  doc.fillColor(PDF_STYLES.colors.text).font(PDF_STYLES.fonts.regular)
  doc.moveDown(0.3)
}

/**
 * Render paragraph with inline formatting (bold, italic, links, images)
 */
async function renderParagraph(
  doc: PDFKit.PDFDocument,
  token: Tokens.Paragraph,
  maxWidth: number
): Promise<void> {
  if (!token.tokens) {
    doc.fontSize(PDF_STYLES.sizes.body).font(PDF_STYLES.fonts.regular).text(token.text || '', {
      width: maxWidth,
      align: 'left',
    })
    doc.moveDown(0.5)
    return
  }

  // Render inline tokens
  const startY = doc.y
  await renderInlineTokens(doc, token.tokens, maxWidth)

  // Only move down if we actually rendered something
  if (doc.y > startY) {
    doc.moveDown(0.5)
  }
}

/**
 * Render inline tokens (strong, em, link, image, text)
 */
async function renderInlineTokens(
  doc: PDFKit.PDFDocument,
  tokens: Token[],
  maxWidth: number
): Promise<void> {
  let currentLine = ''
  let currentFont = PDF_STYLES.fonts.regular
  let currentX = doc.x

  for (const token of tokens) {
    switch (token.type) {
      case 'strong':
        // Render accumulated text first
        if (currentLine) {
          doc.font(currentFont).text(currentLine, currentX, doc.y, { continued: true })
          currentLine = ''
        }
        // Render bold text
        doc.font(PDF_STYLES.fonts.bold).text((token as Tokens.Strong).text, { continued: true })
        currentFont = PDF_STYLES.fonts.regular
        break

      case 'em':
        // Render accumulated text first
        if (currentLine) {
          doc.font(currentFont).text(currentLine, currentX, doc.y, { continued: true })
          currentLine = ''
        }
        // Render italic text
        doc.font(PDF_STYLES.fonts.italic).text((token as Tokens.Em).text, { continued: true })
        currentFont = PDF_STYLES.fonts.regular
        break

      case 'link':
        // Render accumulated text first
        if (currentLine) {
          doc.font(currentFont).text(currentLine, currentX, doc.y, { continued: true })
          currentLine = ''
        }
        // Render link in blue
        const linkToken = token as Tokens.Link
        doc
          .fillColor(PDF_STYLES.colors.primary)
          .font(PDF_STYLES.fonts.regular)
          .text(linkToken.text, { continued: true, link: linkToken.href })
        doc.fillColor(PDF_STYLES.colors.text)
        break

      case 'image':
        // Finish current line first
        if (currentLine) {
          doc.font(currentFont).text(currentLine, { continued: false })
          currentLine = ''
        }
        // Render image
        const imgToken = token as Tokens.Image
        await renderImage(doc, imgToken.href, imgToken.text)
        currentX = doc.x
        break

      case 'text':
        currentLine += (token as Tokens.Text).text
        break

      case 'codespan':
        // Render accumulated text first
        if (currentLine) {
          doc.font(currentFont).text(currentLine, currentX, doc.y, { continued: true })
          currentLine = ''
        }
        // Render code span with gray background
        doc
          .fontSize(PDF_STYLES.sizes.body - 1)
          .fillColor('#666666')
          .text((token as Tokens.Codespan).text, { continued: true })
        doc.fontSize(PDF_STYLES.sizes.body).fillColor(PDF_STYLES.colors.text)
        break

      default:
        if ('text' in token) {
          currentLine += token.text
        }
        break
    }
  }

  // Render any remaining text
  if (currentLine) {
    doc.font(currentFont).text(currentLine, { continued: false })
  } else {
    // If we ended with a continued text, break the line
    doc.text('')
  }
}

/**
 * Render image from URL
 */
async function renderImage(doc: PDFKit.PDFDocument, url: string, alt: string): Promise<void> {
  const imageBuffer = await fetchImageBuffer(url)

  if (!imageBuffer) {
    // Show alt text if image fails
    doc
      .fontSize(PDF_STYLES.sizes.caption)
      .fillColor(PDF_STYLES.colors.lightGray)
      .text(`[Image: ${alt || url}]`)
      .fillColor(PDF_STYLES.colors.text)
    doc.moveDown(0.5)
    return
  }

  try {
    const maxWidth = PDF_STYLES.page.maxImageWidth

    // Check if we need a new page
    if (doc.y > PDF_STYLES.page.height - 300) {
      doc.addPage()
    }

    doc.image(imageBuffer, {
      fit: [maxWidth, 400],
      align: 'center',
    })

    doc.moveDown(0.3)

    if (alt) {
      doc
        .fontSize(PDF_STYLES.sizes.caption)
        .fillColor(PDF_STYLES.colors.lightGray)
        .text(alt, { align: 'center' })
        .fillColor(PDF_STYLES.colors.text)
    }

    doc.moveDown(0.5)
  } catch (error) {
    console.error('Error adding image to PDF:', error)
    doc
      .fontSize(PDF_STYLES.sizes.caption)
      .fillColor(PDF_STYLES.colors.lightGray)
      .text(`[Image could not be loaded: ${alt || url}]`)
      .fillColor(PDF_STYLES.colors.text)
    doc.moveDown(0.5)
  }
}

/**
 * Render list (ordered or unordered)
 */
async function renderList(
  doc: PDFKit.PDFDocument,
  token: Tokens.List,
  maxWidth: number,
  indent: number = 0
): Promise<void> {
  const items = token.items
  const isOrdered = token.ordered
  const startIndex = token.start || 1

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const bullet = isOrdered ? `${startIndex + i}.` : '•'
    const indentWidth = 20 + indent * 20
    const textWidth = maxWidth - indentWidth

    // Render bullet/number
    doc
      .fontSize(PDF_STYLES.sizes.body)
      .font(PDF_STYLES.fonts.regular)
      .text(bullet, PDF_STYLES.spacing.margin + indent * 20, doc.y, {
        width: 20,
        continued: false,
      })

    const bulletY = doc.y - PDF_STYLES.sizes.body * 1.2

    // Render item text
    if (item.tokens) {
      const savedX = doc.x
      doc.x = PDF_STYLES.spacing.margin + indentWidth

      for (const itemToken of item.tokens) {
        if (itemToken.type === 'list') {
          // Nested list
          await renderList(doc, itemToken as Tokens.List, maxWidth, indent + 1)
        } else {
          await renderToken(doc, itemToken, textWidth)
        }
      }

      doc.x = savedX
    } else {
      doc.text(item.text, PDF_STYLES.spacing.margin + indentWidth, bulletY, {
        width: textWidth,
        align: 'left',
      })
    }

    doc.moveDown(0.2)
  }

  doc.moveDown(0.3)
}

/**
 * Render table
 */
async function renderTable(
  doc: PDFKit.PDFDocument,
  token: Tokens.Table,
  maxWidth: number
): Promise<void> {
  const headers = token.header
  const rows = token.rows
  const columnCount = headers.length

  // Calculate column widths
  const columnWidth = maxWidth / columnCount
  const rowHeight = 25
  const cellPadding = 5

  // Check if we need a new page
  const tableHeight = (rows.length + 1) * rowHeight
  if (doc.y + tableHeight > PDF_STYLES.page.height - PDF_STYLES.spacing.margin) {
    doc.addPage()
  }

  let currentY = doc.y

  // Draw header row
  doc.fontSize(PDF_STYLES.sizes.body).font(PDF_STYLES.fonts.bold)

  for (let i = 0; i < headers.length; i++) {
    const x = PDF_STYLES.spacing.margin + i * columnWidth

    // Draw cell background
    doc
      .fillColor('#f0f0f0')
      .rect(x, currentY, columnWidth, rowHeight)
      .fill()

    // Draw cell border
    doc
      .strokeColor(PDF_STYLES.colors.border)
      .rect(x, currentY, columnWidth, rowHeight)
      .stroke()

    // Draw cell text
    const cellText = headers[i].text || ''
    doc
      .fillColor(PDF_STYLES.colors.text)
      .text(cellText, x + cellPadding, currentY + cellPadding, {
        width: columnWidth - cellPadding * 2,
        height: rowHeight - cellPadding * 2,
        align: token.align?.[i] || 'left',
        ellipsis: true,
      })
  }

  currentY += rowHeight

  // Draw data rows
  doc.font(PDF_STYLES.fonts.regular)

  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      const x = PDF_STYLES.spacing.margin + i * columnWidth

      // Draw cell border
      doc
        .strokeColor(PDF_STYLES.colors.border)
        .rect(x, currentY, columnWidth, rowHeight)
        .stroke()

      // Draw cell text
      const cellText = row[i].text || ''
      doc.fillColor(PDF_STYLES.colors.text).text(cellText, x + cellPadding, currentY + cellPadding, {
        width: columnWidth - cellPadding * 2,
        height: rowHeight - cellPadding * 2,
        align: token.align?.[i] || 'left',
        ellipsis: true,
      })
    }

    currentY += rowHeight
  }

  // Move cursor below table
  doc.y = currentY
  doc.moveDown(1)
}

/**
 * Render horizontal rule
 */
function renderHorizontalRule(doc: PDFKit.PDFDocument, maxWidth: number): void {
  doc.moveDown(0.5)
  doc
    .strokeColor(PDF_STYLES.colors.border)
    .lineWidth(1)
    .moveTo(PDF_STYLES.spacing.margin, doc.y)
    .lineTo(PDF_STYLES.spacing.margin + maxWidth, doc.y)
    .stroke()
  doc.moveDown(0.5)
}

/**
 * Render blockquote
 */
async function renderBlockquote(
  doc: PDFKit.PDFDocument,
  token: Tokens.Blockquote,
  maxWidth: number
): Promise<void> {
  const quoteWidth = maxWidth - 30
  const quoteX = PDF_STYLES.spacing.margin + 20

  // Draw left border
  doc
    .strokeColor(PDF_STYLES.colors.primary)
    .lineWidth(3)
    .moveTo(PDF_STYLES.spacing.margin + 10, doc.y)
    .lineTo(PDF_STYLES.spacing.margin + 10, doc.y + 100) // We'll adjust this later
    .stroke()

  const startY = doc.y

  // Render quote content
  doc.fillColor(PDF_STYLES.colors.lightGray)
  const savedX = doc.x
  doc.x = quoteX

  for (const quoteToken of token.tokens) {
    await renderToken(doc, quoteToken, quoteWidth)
  }

  doc.x = savedX
  doc.fillColor(PDF_STYLES.colors.text)

  doc.moveDown(0.5)
}

/**
 * Render code block
 */
function renderCodeBlock(
  doc: PDFKit.PDFDocument,
  token: Tokens.Code,
  maxWidth: number
): void {
  const codeText = token.text

  // Draw background
  const lines = codeText.split('\n')
  const lineHeight = PDF_STYLES.sizes.body * 1.5
  const blockHeight = lines.length * lineHeight + 20

  doc
    .fillColor('#f5f5f5')
    .rect(PDF_STYLES.spacing.margin, doc.y, maxWidth, blockHeight)
    .fill()

  // Draw border
  doc
    .strokeColor(PDF_STYLES.colors.border)
    .rect(PDF_STYLES.spacing.margin, doc.y, maxWidth, blockHeight)
    .stroke()

  // Draw code text
  doc
    .fontSize(PDF_STYLES.sizes.body - 1)
    .fillColor('#333333')
    .font('Courier')
    .text(codeText, PDF_STYLES.spacing.margin + 10, doc.y + 10, {
      width: maxWidth - 20,
    })

  doc.font(PDF_STYLES.fonts.regular).fillColor(PDF_STYLES.colors.text)
  doc.moveDown(1)
}
