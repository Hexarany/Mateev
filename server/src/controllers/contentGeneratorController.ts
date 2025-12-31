import { Response } from 'express'
import { CustomRequest } from '../middleware/auth'
import {
  generateTopicContent,
  generateQuizQuestions,
  generateMassageProtocol,
  generateCourseStructure,
} from '../services/contentGenerator'
import Topic from '../models/Topic'
import Quiz from '../models/Quiz'
import MassageProtocol from '../models/MassageProtocol'
import Category from '../models/Category'

/**
 * Generate and save topic content
 */
export const generateTopic = async (req: CustomRequest, res: Response) => {
  try {
    const { categoryId, topicTitle, difficulty } = req.body

    if (!categoryId || !topicTitle || !topicTitle.ru || !topicTitle.ro) {
      return res.status(400).json({ message: 'Category ID and bilingual title required' })
    }

    const topicData = await generateTopicContent({
      categoryId,
      topicTitle,
      difficulty,
    })

    const topic = await Topic.create(topicData)

    res.status(201).json({
      message: 'Topic generated successfully',
      topic,
    })
  } catch (error: any) {
    console.error('Error generating topic:', error)
    res.status(500).json({ message: error.message || 'Failed to generate topic' })
  }
}

/**
 * Generate and save quiz
 */
export const generateQuiz = async (req: CustomRequest, res: Response) => {
  try {
    const { topicId, questionCount, difficulty } = req.body

    if (!topicId) {
      return res.status(400).json({ message: 'Topic ID required' })
    }

    const quizData = await generateQuizQuestions({
      topicId,
      questionCount,
      difficulty,
    })

    const quiz = await Quiz.create(quizData)

    res.status(201).json({
      message: 'Quiz generated successfully',
      quiz,
    })
  } catch (error: any) {
    console.error('Error generating quiz:', error)
    res.status(500).json({ message: error.message || 'Failed to generate quiz' })
  }
}

/**
 * Generate and save massage protocol
 */
export const generateProtocol = async (req: CustomRequest, res: Response) => {
  try {
    const { protocolTitle, targetArea, duration } = req.body

    if (!protocolTitle || !protocolTitle.ru || !protocolTitle.ro) {
      return res.status(400).json({ message: 'Bilingual title required' })
    }

    const protocolData = await generateMassageProtocol({
      protocolTitle,
      targetArea: targetArea || 'General',
      duration,
    })

    const protocol = await MassageProtocol.create(protocolData)

    res.status(201).json({
      message: 'Protocol generated successfully',
      protocol,
    })
  } catch (error: any) {
    console.error('Error generating protocol:', error)
    res.status(500).json({ message: error.message || 'Failed to generate protocol' })
  }
}

/**
 * Generate complete course structure
 */
export const generateCourse = async (req: CustomRequest, res: Response) => {
  try {
    const { courseName, moduleCount, generateContent } = req.body

    if (!courseName) {
      return res.status(400).json({ message: 'Course name required' })
    }

    const courseStructure = await generateCourseStructure(courseName, moduleCount || 5)

    const results = {
      course: courseStructure.course,
      categoriesCreated: 0,
      topicsCreated: 0,
      categories: [] as any[],
    }

    // Create categories and topics
    for (const module of courseStructure.modules) {
      const category = await Category.create({
        name: {
          ru: module.name_ru,
          ro: module.name_ro,
        },
        description: {
          ru: module.description_ru,
          ro: module.description_ro,
        },
        order: module.order,
        icon: 'MenuBookIcon',
      })

      results.categoriesCreated++

      const topics = []

      if (generateContent) {
        // Generate full content for each topic
        for (const topicInfo of module.topics) {
          try {
            const topicData = await generateTopicContent({
              categoryId: category._id.toString(),
              topicTitle: {
                ru: topicInfo.name_ru,
                ro: topicInfo.name_ro,
              },
              difficulty: topicInfo.difficulty,
            })

            const topic = await Topic.create(topicData)
            topics.push(topic)
            results.topicsCreated++
          } catch (error) {
            console.error(`Failed to generate topic ${topicInfo.name_ru}:`, error)
          }
        }
      } else {
        // Create topics with basic info only
        for (const topicInfo of module.topics) {
          const topic = await Topic.create({
            name: {
              ru: topicInfo.name_ru,
              ro: topicInfo.name_ro,
            },
            category: category._id,
            estimatedTime: topicInfo.estimatedTime,
            difficulty: topicInfo.difficulty,
            order: 0,
          })
          topics.push(topic)
          results.topicsCreated++
        }
      }

      results.categories.push({
        category,
        topics,
      })
    }

    res.status(201).json({
      message: 'Course structure generated successfully',
      ...results,
    })
  } catch (error: any) {
    console.error('Error generating course:', error)
    res.status(500).json({ message: error.message || 'Failed to generate course' })
  }
}

/**
 * Preview generated content (without saving)
 */
export const previewContent = async (req: CustomRequest, res: Response) => {
  try {
    const { type, ...params } = req.body

    let preview

    switch (type) {
      case 'topic':
        preview = await generateTopicContent(params)
        break
      case 'quiz':
        preview = await generateQuizQuestions(params)
        break
      case 'protocol':
        preview = await generateMassageProtocol(params)
        break
      case 'course':
        preview = await generateCourseStructure(params.courseName, params.moduleCount)
        break
      default:
        return res.status(400).json({ message: 'Invalid content type' })
    }

    res.json({
      message: 'Content preview generated',
      preview,
    })
  } catch (error: any) {
    console.error('Error previewing content:', error)
    res.status(500).json({ message: error.message || 'Failed to preview content' })
  }
}
