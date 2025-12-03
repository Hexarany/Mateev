import { Request, Response } from 'express'
import Topic from '../models/Topic'
import MassageProtocol from '../models/MassageProtocol'
import TriggerPoint from '../models/TriggerPoint'
import HygieneGuideline from '../models/HygieneGuideline'
import AnatomyModel3D from '../models/AnatomyModel3D'
import Quiz from '../models/Quiz'

// Расширяем стандартный тип Request для доступа к userId
interface CustomRequest extends Request {
  userId?: string
}

interface SearchResult {
  type: 'topic' | 'protocol' | 'trigger_point' | 'hygiene' | 'model_3d' | 'quiz'
  id: string
  title: {
    ru: string
    ro: string
  }
  description?: {
    ru: string
    ro: string
  }
  slug?: string
  category?: string
  thumbnail?: string
}

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { query, type, lang = 'ru' } = req.query

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' })
    }

    const searchQuery = query.trim()
    if (searchQuery.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' })
    }

    const results: SearchResult[] = []

    // Создаем регулярное выражение для поиска (case-insensitive)
    const regex = new RegExp(searchQuery, 'i')

    // Определяем, по каким типам искать
    const searchTypes = type ? [type] : ['topic', 'protocol', 'trigger_point', 'hygiene', 'model_3d', 'quiz']

    // Поиск по темам анатомии
    if (searchTypes.includes('topic')) {
      const topics = await Topic.find({
        $or: [
          { 'name.ru': regex },
          { 'name.ro': regex },
          { 'description.ru': regex },
          { 'description.ro': regex },
          { 'content.ru': regex },
          { 'content.ro': regex },
        ],
      })
        .populate('categoryId', 'name')
        .limit(20)

      topics.forEach((topic: any) => {
        const categoryName = topic.categoryId && typeof topic.categoryId === 'object' && 'name' in topic.categoryId ? topic.categoryId.name : undefined
        results.push({
          type: 'topic',
          id: String(topic._id),
          title: topic.name,
          description: topic.description,
          category: categoryName ? categoryName[lang as 'ru' | 'ro'] : undefined,
        })
      })
    }

    // Поиск по массажным протоколам
    if (searchTypes.includes('protocol')) {
      const protocols = await MassageProtocol.find({
        $or: [
          { 'name.ru': regex },
          { 'name.ro': regex },
          { 'description.ru': regex },
          { 'description.ro': regex },
          { 'indications.ru': regex },
          { 'indications.ro': regex },
        ],
      }).limit(20)

      protocols.forEach((protocol: any) => {
        results.push({
          type: 'protocol',
          id: String(protocol._id),
          title: protocol.name,
          description: protocol.description,
          slug: protocol.slug,
          thumbnail: protocol.thumbnail || undefined,
        })
      })
    }

    // Поиск по триггерным точкам
    if (searchTypes.includes('trigger_point')) {
      const triggerPoints = await TriggerPoint.find({
        $or: [
          { 'name.ru': regex },
          { 'name.ro': regex },
          { 'muscleName.ru': regex },
          { 'muscleName.ro': regex },
          { 'location.ru': regex },
          { 'location.ro': regex },
        ],
      }).limit(20)

      triggerPoints.forEach((point: any) => {
        results.push({
          type: 'trigger_point',
          id: String(point._id),
          title: point.name,
          description: point.muscleName || undefined,
          slug: point.slug,
          thumbnail: point.thumbnail || undefined,
        })
      })
    }

    // Поиск по руководствам гигиены
    if (searchTypes.includes('hygiene')) {
      const guidelines = await HygieneGuideline.find({
        $or: [
          { 'title.ru': regex },
          { 'title.ro': regex },
          { 'content.ru': regex },
          { 'content.ro': regex },
        ],
      }).limit(20)

      guidelines.forEach((guideline: any) => {
        results.push({
          type: 'hygiene',
          id: String(guideline._id),
          title: guideline.title,
          category: guideline.category,
        })
      })
    }

    // Поиск по 3D моделям
    if (searchTypes.includes('model_3d')) {
      const models = await AnatomyModel3D.find({
        $or: [
          { 'name.ru': regex },
          { 'name.ro': regex },
          { 'description.ru': regex },
          { 'description.ro': regex },
        ],
      }).limit(20)

      models.forEach((model: any) => {
        results.push({
          type: 'model_3d',
          id: String(model._id),
          title: model.name,
          description: model.description,
          slug: model.slug,
          thumbnail: model.thumbnail || undefined,
        })
      })
    }

    // Поиск по тестам
    if (searchTypes.includes('quiz')) {
      const quizzes = await Quiz.find({
        $or: [
          { 'title.ru': regex },
          { 'title.ro': regex },
          { 'description.ru': regex },
          { 'description.ro': regex },
        ],
      })
        .populate('categoryId', 'name')
        .limit(20)

      quizzes.forEach((quiz: any) => {
        const categoryName = quiz.categoryId && typeof quiz.categoryId === 'object' && 'name' in quiz.categoryId ? quiz.categoryId.name : undefined
        results.push({
          type: 'quiz',
          id: String(quiz._id),
          title: quiz.title,
          description: quiz.description,
          category: categoryName ? categoryName[lang as 'ru' | 'ro'] : undefined,
        })
      })
    }

    // Сортируем результаты по релевантности (можно улучшить)
    // Пока просто перемешиваем типы для разнообразия
    const sortedResults = results.sort((a, b) => {
      const aTitle = a.title[lang as 'ru' | 'ro'].toLowerCase()
      const bTitle = b.title[lang as 'ru' | 'ro'].toLowerCase()
      const searchLower = searchQuery.toLowerCase()

      // Приоритет: точное совпадение > начинается с > содержит
      const aExact = aTitle === searchLower
      const bExact = bTitle === searchLower
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      const aStarts = aTitle.startsWith(searchLower)
      const bStarts = bTitle.startsWith(searchLower)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1

      return 0
    })

    res.json({
      query: searchQuery,
      total: sortedResults.length,
      results: sortedResults.slice(0, 50), // Максимум 50 результатов
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ message: 'Failed to perform search' })
  }
}

// Получить историю поиска пользователя
export const getSearchHistory = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId

    // Здесь можно реализовать сохранение истории в базу
    // Пока вернем пустой массив
    res.json([])
  } catch (error) {
    console.error('Get search history error:', error)
    res.status(500).json({ message: 'Failed to get search history' })
  }
}

// Сохранить поисковый запрос в историю
export const saveSearchQuery = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { query } = req.body

    // Здесь можно реализовать сохранение в базу
    // Пока просто возвращаем успех
    res.json({ success: true })
  } catch (error) {
    console.error('Save search query error:', error)
    res.status(500).json({ message: 'Failed to save search query' })
  }
}
