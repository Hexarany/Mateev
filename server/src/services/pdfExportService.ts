import PDFDocument from 'pdfkit'
import {
  PDF_STYLES,
  addPdfHeader,
  addSectionHeading,
  addBodyText,
  addSeparator,
  addImageToPdf,
  addMetadataField,
  checkPageBreak,
  formatDifficulty,
  formatCategory,
} from '../utils/pdfHelpers'

interface MultiLangText {
  ru: string
  ro: string
}

interface MediaFile {
  url: string
  filename: string
  caption?: MultiLangText
  type: 'image' | 'video'
}

interface MassageProtocol {
  name: MultiLangText
  description: MultiLangText
  content: MultiLangText
  type: string
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  benefits: MultiLangText
  contraindications: MultiLangText
  technique: MultiLangText
  images?: MediaFile[]
  videos?: MediaFile[]
  order: number
}

interface TriggerPoint {
  name: MultiLangText
  muscle: string
  location: MultiLangText
  symptoms: MultiLangText
  referralPattern: MultiLangText
  technique: MultiLangText
  contraindications?: MultiLangText
  images?: MediaFile[]
  videos?: MediaFile[]
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface HygieneGuideline {
  title: MultiLangText
  category: string
  content: MultiLangText
  images?: MediaFile[]
  order: number
}

interface AnatomyModel3D {
  name: MultiLangText
  description: MultiLangText
  category: string
  modelUrl: string
  previewImage?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags?: MultiLangText[]
  attribution?: {
    author: string
    source: string
    sourceUrl?: string
    license: string
  }
}

interface YouTubeVideo {
  url: string
  title: MultiLangText
  description?: MultiLangText
  author?: string
  duration?: number
}

interface Topic {
  name: MultiLangText
  description: MultiLangText
  content: MultiLangText
  images?: MediaFile[]
  videos?: MediaFile[]
  youtubeVideos?: YouTubeVideo[]
  model3D?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  region?: MultiLangText
}

/**
 * Generate PDF for Massage Protocols
 */
export async function generateMassageProtocolsPdf(
  doc: PDFKit.PDFDocument,
  protocols: MassageProtocol[],
  language: 'ru' | 'ro'
): Promise<void> {
  const title = language === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj'
  addPdfHeader(doc, title)

  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i]

    if (i > 0) {
      checkPageBreak(doc, 300)
      addSeparator(doc, 'solid')
      doc.moveDown(1)
    }

    // Protocol name
    addSectionHeading(doc, protocol.name[language], 1)

    // Metadata
    addMetadataField(
      doc,
      language === 'ru' ? 'Тип' : 'Tip',
      protocol.type || (language === 'ru' ? 'Не указан' : 'Nespecificat')
    )
    addMetadataField(
      doc,
      language === 'ru' ? 'Продолжительность' : 'Durată',
      `${protocol.duration} ${language === 'ru' ? 'мин' : 'min'}`
    )
    addMetadataField(
      doc,
      language === 'ru' ? 'Сложность' : 'Dificultate',
      formatDifficulty(protocol.difficulty, language)
    )

    doc.moveDown(0.5)

    // Description
    if (protocol.description?.[language]) {
      addSectionHeading(doc, language === 'ru' ? 'ОПИСАНИЕ' : 'DESCRIERE', 2)
      addBodyText(doc, protocol.description[language])
    }

    // Content
    if (protocol.content?.[language]) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'СОДЕРЖАНИЕ' : 'CONȚINUT', 2)
      addBodyText(doc, protocol.content[language])
    }

    // Benefits
    if (protocol.benefits?.[language]) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ПОЛЬЗА' : 'BENEFICII', 2)
      addBodyText(doc, protocol.benefits[language])
    }

    // Contraindications
    if (protocol.contraindications?.[language]) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ПРОТИВОПОКАЗАНИЯ' : 'CONTRAINDICAȚII', 2)
      addBodyText(doc, protocol.contraindications[language])
    }

    // Technique
    if (protocol.technique?.[language]) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ТЕХНИКА ВЫПОЛНЕНИЯ' : 'TEHNICA DE EXECUȚIE', 2)
      addBodyText(doc, protocol.technique[language])
    }

    // Images
    if (protocol.images && protocol.images.length > 0) {
      checkPageBreak(doc, 250)
      addSectionHeading(doc, language === 'ru' ? 'ИЗОБРАЖЕНИЯ' : 'IMAGINI', 2)

      for (const image of protocol.images) {
        await addImageToPdf(doc, image.url, image.caption?.[language])
      }
    }

    // Videos
    if (protocol.videos && protocol.videos.length > 0) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ВИДЕО' : 'VIDEOCLIPURI', 2)

      for (const video of protocol.videos) {
        doc
          .fontSize(PDF_STYLES.sizes.body)
          .fillColor(PDF_STYLES.colors.text)
          .text(`• ${video.filename || video.url}`, {
            link: video.url,
            underline: true,
            continued: false,
          })

        if (video.caption?.[language]) {
          doc
            .fontSize(PDF_STYLES.sizes.caption)
            .fillColor(PDF_STYLES.colors.lightGray)
            .text(`  ${video.caption[language]}`)
        }

        doc.moveDown(0.3)
      }
    }

    doc.moveDown(1)
  }
}

/**
 * Generate PDF for Trigger Points
 */
export async function generateTriggerPointsPdf(
  doc: PDFKit.PDFDocument,
  points: TriggerPoint[],
  language: 'ru' | 'ro'
): Promise<void> {
  const title = language === 'ru' ? 'Триггерные точки' : 'Puncte de declanșare'
  addPdfHeader(doc, title)

  for (let i = 0; i < points.length; i++) {
    const point = points[i]

    if (i > 0) {
      checkPageBreak(doc, 300)
      addSeparator(doc, 'solid')
      doc.moveDown(1)
    }

    // Point name
    addSectionHeading(doc, point.name[language], 1)

    // Metadata
    addMetadataField(
      doc,
      language === 'ru' ? 'Мышца' : 'Mușchi',
      point.muscle || (language === 'ru' ? 'Не указана' : 'Nespecificat')
    )
    addMetadataField(
      doc,
      language === 'ru' ? 'Категория' : 'Categorie',
      formatCategory(point.category, language)
    )
    addMetadataField(
      doc,
      language === 'ru' ? 'Сложность' : 'Dificultate',
      formatDifficulty(point.difficulty, language)
    )

    doc.moveDown(0.5)

    // Location
    if (point.location?.[language]) {
      addSectionHeading(doc, language === 'ru' ? 'ЛОКАЛИЗАЦИЯ' : 'LOCALIZARE', 2)
      addBodyText(doc, point.location[language])
    }

    // Symptoms
    if (point.symptoms?.[language]) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'СИМПТОМЫ' : 'SIMPTOME', 2)
      addBodyText(doc, point.symptoms[language])
    }

    // Referral Pattern
    if (point.referralPattern?.[language]) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ПАТТЕРН ОТРАЖЕННОЙ БОЛИ' : 'MODEL DE DURERE REFERATĂ', 2)
      addBodyText(doc, point.referralPattern[language])
    }

    // Technique
    if (point.technique?.[language]) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ТЕХНИКА РАБОТЫ' : 'TEHNICA DE LUCRU', 2)
      addBodyText(doc, point.technique[language])
    }

    // Contraindications
    if (point.contraindications?.[language]) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ПРОТИВОПОКАЗАНИЯ' : 'CONTRAINDICAȚII', 2)
      addBodyText(doc, point.contraindications[language])
    }

    // Images
    if (point.images && point.images.length > 0) {
      checkPageBreak(doc, 250)
      addSectionHeading(doc, language === 'ru' ? 'ИЗОБРАЖЕНИЯ' : 'IMAGINI', 2)

      for (const image of point.images) {
        await addImageToPdf(doc, image.url, image.caption?.[language])
      }
    }

    // Videos
    if (point.videos && point.videos.length > 0) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ВИДЕО' : 'VIDEOCLIPURI', 2)

      for (const video of point.videos) {
        doc
          .fontSize(PDF_STYLES.sizes.body)
          .fillColor(PDF_STYLES.colors.text)
          .text(`• ${video.filename || video.url}`, {
            link: video.url,
            underline: true,
            continued: false,
          })

        if (video.caption?.[language]) {
          doc
            .fontSize(PDF_STYLES.sizes.caption)
            .fillColor(PDF_STYLES.colors.lightGray)
            .text(`  ${video.caption[language]}`)
        }

        doc.moveDown(0.3)
      }
    }

    doc.moveDown(1)
  }
}

/**
 * Generate PDF for Hygiene Guidelines
 */
export async function generateHygieneGuidelinesPdf(
  doc: PDFKit.PDFDocument,
  guidelines: HygieneGuideline[],
  language: 'ru' | 'ro'
): Promise<void> {
  const title = language === 'ru' ? 'Правила гигиены' : 'Reguli de igienă'
  addPdfHeader(doc, title)

  for (let i = 0; i < guidelines.length; i++) {
    const guideline = guidelines[i]

    if (i > 0) {
      checkPageBreak(doc, 300)
      addSeparator(doc, 'solid')
      doc.moveDown(1)
    }

    // Guideline title
    addSectionHeading(doc, guideline.title[language], 1)

    // Metadata
    addMetadataField(
      doc,
      language === 'ru' ? 'Категория' : 'Categorie',
      formatCategory(guideline.category, language)
    )

    doc.moveDown(0.5)

    // Content
    if (guideline.content?.[language]) {
      addSectionHeading(doc, language === 'ru' ? 'СОДЕРЖАНИЕ' : 'CONȚINUT', 2)
      addBodyText(doc, guideline.content[language])
    }

    // Images
    if (guideline.images && guideline.images.length > 0) {
      checkPageBreak(doc, 250)
      addSectionHeading(doc, language === 'ru' ? 'ИЗОБРАЖЕНИЯ' : 'IMAGINI', 2)

      for (const image of guideline.images) {
        await addImageToPdf(doc, image.url, image.caption?.[language])
      }
    }

    doc.moveDown(1)
  }
}

/**
 * Generate PDF for Anatomy 3D Models
 */
export async function generateAnatomyModelsPdf(
  doc: PDFKit.PDFDocument,
  models: AnatomyModel3D[],
  language: 'ru' | 'ro'
): Promise<void> {
  const title = language === 'ru' ? '3D Модели анатомии' : 'Modele 3D de anatomie'
  addPdfHeader(doc, title)

  for (let i = 0; i < models.length; i++) {
    const model = models[i]

    if (i > 0) {
      checkPageBreak(doc, 300)
      addSeparator(doc, 'solid')
      doc.moveDown(1)
    }

    // Model name
    addSectionHeading(doc, model.name[language], 1)

    // Metadata
    addMetadataField(
      doc,
      language === 'ru' ? 'Категория' : 'Categorie',
      formatCategory(model.category, language)
    )
    addMetadataField(
      doc,
      language === 'ru' ? 'Сложность' : 'Dificultate',
      formatDifficulty(model.difficulty, language)
    )

    // Model URL
    if (model.modelUrl) {
      doc
        .fontSize(PDF_STYLES.sizes.body)
        .font(PDF_STYLES.fonts.bold)
        .fillColor(PDF_STYLES.colors.text)
        .text(language === 'ru' ? '3D Модель: ' : 'Model 3D: ', {
          continued: true,
        })
        .font(PDF_STYLES.fonts.regular)
        .fillColor(PDF_STYLES.colors.primary)
        .text(model.modelUrl, {
          link: model.modelUrl,
          underline: true,
        })
        .fillColor(PDF_STYLES.colors.text)
        .moveDown(0.3)
    }

    doc.moveDown(0.5)

    // Description
    if (model.description?.[language]) {
      addSectionHeading(doc, language === 'ru' ? 'ОПИСАНИЕ' : 'DESCRIERE', 2)
      addBodyText(doc, model.description[language])
    }

    // Tags
    if (model.tags && model.tags.length > 0) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ТЕГИ' : 'ETICHETE', 2)

      const tagTexts = model.tags.map((tag) => tag[language]).filter(Boolean)
      if (tagTexts.length > 0) {
        doc
          .fontSize(PDF_STYLES.sizes.body)
          .fillColor(PDF_STYLES.colors.text)
          .text(tagTexts.join(', '))
          .moveDown(0.5)
      }
    }

    // Attribution
    if (model.attribution) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'АТРИБУЦИЯ' : 'ATRIBUIRE', 2)

      addMetadataField(
        doc,
        language === 'ru' ? 'Автор' : 'Autor',
        model.attribution.author
      )
      addMetadataField(
        doc,
        language === 'ru' ? 'Источник' : 'Sursă',
        model.attribution.source
      )

      if (model.attribution.sourceUrl) {
        doc
          .fontSize(PDF_STYLES.sizes.body)
          .font(PDF_STYLES.fonts.bold)
          .fillColor(PDF_STYLES.colors.text)
          .text(language === 'ru' ? 'Ссылка: ' : 'Link: ', {
            continued: true,
          })
          .font(PDF_STYLES.fonts.regular)
          .fillColor(PDF_STYLES.colors.primary)
          .text(model.attribution.sourceUrl, {
            link: model.attribution.sourceUrl,
            underline: true,
          })
          .fillColor(PDF_STYLES.colors.text)
          .moveDown(0.3)
      }

      addMetadataField(
        doc,
        language === 'ru' ? 'Лицензия' : 'Licență',
        model.attribution.license
      )
    }

    // Preview Image
    if (model.previewImage) {
      checkPageBreak(doc, 250)
      addSectionHeading(doc, language === 'ru' ? 'ПРЕДПРОСМОТР' : 'PREVIZUALIZARE', 2)
      await addImageToPdf(doc, model.previewImage)
    }

    doc.moveDown(1)
  }
}

/**
 * Generate PDF for Topics (Anatomy Themes)
 */
export async function generateTopicsPdf(
  doc: PDFKit.PDFDocument,
  topics: Topic[],
  language: 'ru' | 'ro'
): Promise<void> {
  const title = language === 'ru' ? 'Темы по анатомии' : 'Teme de anatomie'
  addPdfHeader(doc, title)

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i]

    if (i > 0) {
      checkPageBreak(doc, 300)
      addSeparator(doc, 'solid')
      doc.moveDown(1)
    }

    // Topic name
    addSectionHeading(doc, topic.name[language], 1)

    // Metadata
    addMetadataField(
      doc,
      language === 'ru' ? 'Сложность' : 'Dificultate',
      formatDifficulty(topic.difficulty, language)
    )
    addMetadataField(
      doc,
      language === 'ru' ? 'Время изучения' : 'Timp de studiu',
      `${topic.estimatedTime} ${language === 'ru' ? 'мин' : 'min'}`
    )

    if (topic.region?.[language]) {
      addMetadataField(
        doc,
        language === 'ru' ? 'Регион' : 'Regiune',
        topic.region[language]
      )
    }

    doc.moveDown(0.5)

    // Description
    if (topic.description?.[language]) {
      addSectionHeading(doc, language === 'ru' ? 'ОПИСАНИЕ' : 'DESCRIERE', 2)
      addBodyText(doc, topic.description[language])
    }

    // Content
    if (topic.content?.[language]) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'СОДЕРЖАНИЕ' : 'CONȚINUT', 2)
      addBodyText(doc, topic.content[language])
    }

    // Images
    if (topic.images && topic.images.length > 0) {
      checkPageBreak(doc, 250)
      addSectionHeading(doc, language === 'ru' ? 'ИЗОБРАЖЕНИЯ' : 'IMAGINI', 2)

      for (const image of topic.images) {
        if (image.type === 'image') {
          await addImageToPdf(doc, image.url, image.caption?.[language])
        }
      }
    }

    // Videos
    const allVideos = [
      ...(topic.videos?.filter(v => v.type === 'video') || []),
    ]

    if (allVideos.length > 0) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'ВИДЕО' : 'VIDEOCLIPURI', 2)

      for (const video of allVideos) {
        doc
          .fontSize(PDF_STYLES.sizes.body)
          .fillColor(PDF_STYLES.colors.text)
          .text(`• ${video.filename || video.url}`, {
            link: video.url,
            underline: true,
            continued: false,
          })

        if (video.caption?.[language]) {
          doc
            .fontSize(PDF_STYLES.sizes.caption)
            .fillColor(PDF_STYLES.colors.lightGray)
            .text(`  ${video.caption[language]}`)
        }

        doc.moveDown(0.3)
      }
    }

    // YouTube Videos
    if (topic.youtubeVideos && topic.youtubeVideos.length > 0) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? 'YOUTUBE ВИДЕО' : 'VIDEOCLIPURI YOUTUBE', 2)

      for (const ytVideo of topic.youtubeVideos) {
        doc
          .fontSize(PDF_STYLES.sizes.body)
          .fillColor(PDF_STYLES.colors.text)
          .text(`• ${ytVideo.title[language]}`, {
            link: ytVideo.url,
            underline: true,
            continued: false,
          })

        if (ytVideo.description?.[language]) {
          doc
            .fontSize(PDF_STYLES.sizes.caption)
            .fillColor(PDF_STYLES.colors.lightGray)
            .text(`  ${ytVideo.description[language]}`)
        }

        if (ytVideo.author) {
          doc
            .fontSize(PDF_STYLES.sizes.caption)
            .fillColor(PDF_STYLES.colors.lightGray)
            .text(`  ${language === 'ru' ? 'Автор' : 'Autor'}: ${ytVideo.author}`)
        }

        if (ytVideo.duration) {
          doc
            .fontSize(PDF_STYLES.sizes.caption)
            .fillColor(PDF_STYLES.colors.lightGray)
            .text(`  ${language === 'ru' ? 'Длительность' : 'Durată'}: ${ytVideo.duration} ${language === 'ru' ? 'мин' : 'min'}`)
        }

        doc.moveDown(0.5)
      }
    }

    // 3D Model
    if (topic.model3D) {
      checkPageBreak(doc)
      addSectionHeading(doc, language === 'ru' ? '3D МОДЕЛЬ' : 'MODEL 3D', 2)

      doc
        .fontSize(PDF_STYLES.sizes.body)
        .fillColor(PDF_STYLES.colors.primary)
        .text(topic.model3D, {
          link: topic.model3D,
          underline: true,
        })
        .fillColor(PDF_STYLES.colors.text)
        .moveDown(0.5)
    }

    doc.moveDown(1)
  }
}
