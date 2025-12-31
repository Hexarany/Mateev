import { Response } from 'express'
import { CustomRequest } from '../middleware/auth'
import {
  searchWikimediaImages,
  searchWikipediaArticles,
  getWikipediaContent,
  searchPubMed,
  importFromWikipedia,
  translateMedicalContent,
} from '../services/externalAPIs'
import Topic from '../models/Topic'
import Media from '../models/Media'
import path from 'path'
import fs from 'fs/promises'
import axios from 'axios'

/**
 * Search for images on Wikimedia Commons
 */
export const searchImages = async (req: CustomRequest, res: Response) => {
  try {
    const { query, limit = 10 } = req.query

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query required' })
    }

    const images = await searchWikimediaImages(query, parseInt(limit as string))

    res.json({
      message: 'Images found',
      count: images.length,
      images,
    })
  } catch (error: any) {
    console.error('Error searching images:', error)
    res.status(500).json({ message: error.message || 'Failed to search images' })
  }
}

/**
 * Search Wikipedia articles
 */
export const searchArticles = async (req: CustomRequest, res: Response) => {
  try {
    const { query, language = 'en', limit = 5 } = req.query

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query required' })
    }

    const articles = await searchWikipediaArticles(
      query,
      language as 'ru' | 'en',
      parseInt(limit as string)
    )

    res.json({
      message: 'Articles found',
      count: articles.length,
      articles,
    })
  } catch (error: any) {
    console.error('Error searching articles:', error)
    res.status(500).json({ message: error.message || 'Failed to search articles' })
  }
}

/**
 * Get full Wikipedia article content
 */
export const getArticle = async (req: CustomRequest, res: Response) => {
  try {
    const { title, language = 'en' } = req.query

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'Article title required' })
    }

    const content = await getWikipediaContent(title, language as 'ru' | 'en')

    if (!content) {
      return res.status(404).json({ message: 'Article not found' })
    }

    res.json({
      message: 'Article retrieved',
      content,
    })
  } catch (error: any) {
    console.error('Error getting article:', error)
    res.status(500).json({ message: error.message || 'Failed to get article' })
  }
}

/**
 * Search PubMed articles
 */
export const searchMedicalLiterature = async (req: CustomRequest, res: Response) => {
  try {
    const { query, limit = 5 } = req.query

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query required' })
    }

    const articles = await searchPubMed(query, parseInt(limit as string))

    res.json({
      message: 'Medical articles found',
      count: articles.length,
      articles,
    })
  } catch (error: any) {
    console.error('Error searching PubMed:', error)
    res.status(500).json({ message: error.message || 'Failed to search medical literature' })
  }
}

/**
 * Import topic from Wikipedia and create in database
 */
export const importTopicFromWikipedia = async (req: CustomRequest, res: Response) => {
  try {
    const { term, categoryId, includeImages = true, translateToRomanian = true } = req.body

    if (!term || !categoryId) {
      return res.status(400).json({ message: 'Term and category ID required' })
    }

    // Import content from Wikipedia
    const importedData = await importFromWikipedia(term, {
      includeImages,
      translateToRomanian,
    })

    // Create topic
    const topic = await Topic.create({
      name: {
        ru: importedData.title.ru,
        ro: importedData.title.en, // Fallback to English if Romanian not available
      },
      category: categoryId,
      description: {
        ru: importedData.content.ru.description,
        ro: importedData.content.ro?.description || importedData.content.ru.description,
      },
      content: {
        ru: JSON.stringify(importedData.content.ru),
        ro: JSON.stringify(importedData.content.ro || importedData.content.ru),
      },
      order: 0,
      estimatedTime: 45,
    })

    // Download and save images if requested
    const savedImages = []
    if (includeImages && importedData.images.length > 0) {
      const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'imported')
      await fs.mkdir(uploadDir, { recursive: true })

      for (const image of importedData.images.slice(0, 5)) {
        try {
          const response = await axios.get(image.thumbUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
          })

          const ext = path.extname(image.title) || '.jpg'
          const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
          const filepath = path.join(uploadDir, filename)

          await fs.writeFile(filepath, response.data)

          const media = await Media.create({
            filename,
            originalName: image.title,
            mimeType: response.headers['content-type'] || 'image/jpeg',
            size: response.data.length,
            path: `/uploads/imported/${filename}`,
            uploadedBy: req.userId,
            category: 'image',
            description: {
              ru: image.description,
              ro: image.description,
            },
          })

          savedImages.push(media)
        } catch (error) {
          console.error(`Failed to download image ${image.title}:`, error)
        }
      }
    }

    res.status(201).json({
      message: 'Topic imported successfully',
      topic,
      images: savedImages,
      sources: importedData.sources,
    })
  } catch (error: any) {
    console.error('Error importing topic:', error)
    res.status(500).json({ message: error.message || 'Failed to import topic' })
  }
}

/**
 * Translate text using Claude
 */
export const translateText = async (req: CustomRequest, res: Response) => {
  try {
    const { text, fromLanguage, toLanguage } = req.body

    if (!text || !fromLanguage || !toLanguage) {
      return res.status(400).json({ message: 'Text, from language, and to language required' })
    }

    const translated = await translateMedicalContent(text, fromLanguage, toLanguage)

    res.json({
      message: 'Translation complete',
      original: text,
      translated,
      fromLanguage,
      toLanguage,
    })
  } catch (error: any) {
    console.error('Error translating:', error)
    res.status(500).json({ message: error.message || 'Failed to translate' })
  }
}
