import { Request, Response } from 'express'
import Quiz from '../models/Quiz'
import User from '../models/User'
import { TelegramNotificationService } from '../services/telegram/notificationService'
import { createAuditLog } from '../services/auditLogService'

interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
  hasActiveSubscription?: boolean
}

// Helper: Check if user has access to quizzes (Premium tier only)
const hasAccessToQuiz = async (
  userId: string | undefined,
  userRole: string | undefined
): Promise<{ hasAccess: boolean; userAccessLevel: string }> => {
  // Admins and teachers have full access
  if (userRole === 'admin' || userRole === 'teacher') {
    return { hasAccess: true, userAccessLevel: 'premium' }
  }

  // Get user access level
  let userAccessLevel: 'free' | 'basic' | 'premium' = 'free'
  if (userId) {
    const user = await User.findById(userId)
    userAccessLevel = user?.accessLevel || 'free'
  }

  // Only Premium users have full access to quizzes
  const hasAccess = userAccessLevel === 'premium'

  return { hasAccess, userAccessLevel }
}

// Helper: Randomly select N questions from the quiz
const getRandomQuestions = (questions: any[], count: number = 10) => {
  if (questions.length <= count) {
    // If quiz has 10 or fewer questions, return all shuffled
    return [...questions].sort(() => Math.random() - 0.5)
  }

  // Fisher-Yates shuffle to get random sample
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count)
}

// Helper: Apply content lock
const createSafeQuiz = (quiz: any, hasAccess: boolean, userAccessLevel: string) => {
  // For users with access, return 10 random questions from the question bank
  const questions = hasAccess && quiz.questions && quiz.questions.length > 0
    ? getRandomQuestions(quiz.questions, 10)
    : []

  return {
    ...quiz.toObject(),
    questions, // Return 10 random questions for premium users, empty array for others
    totalQuestionsInBank: quiz.questions?.length || 0, // Show total available questions
    hasFullContentAccess: hasAccess,
    accessInfo: {
      hasFullAccess: hasAccess,
      userAccessLevel,
      requiredTier: 'premium', // Quizzes require premium tier
    },
  }
}

// =======================================================
// READ Functions (Assumed existing)
// =======================================================

export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find().populate('topicId').populate('categoryId')
    res.json(quizzes)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch quizzes' } })
  }
}

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('topicId').populate('categoryId')
    if (!quiz) {
      return res.status(404).json({ error: { message: 'Quiz not found' } })
    }

    // Apply tier-based access control
    const customReq = req as CustomRequest
    const accessInfo = await hasAccessToQuiz(customReq.userId, customReq.userRole)

    const safeQuiz = createSafeQuiz(quiz, accessInfo.hasAccess, accessInfo.userAccessLevel)

    res.json(safeQuiz)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch quiz' } })
  }
}

export const getQuizzesByTopic = async (req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find({ topicId: req.params.topicId }).populate('topicId').populate('categoryId')
    res.json(quizzes)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch quizzes by topic' } })
  }
}

// =======================================================
// CRUD Functions (New Implementation)
// =======================================================

// НОВЫЙ: Создание викторины
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = new Quiz(req.body)
    await quiz.save()

    // Send Telegram notifications about new quiz (non-blocking)
    if (process.env.TELEGRAM_BOT_TOKEN) {
      TelegramNotificationService.notifyNewQuiz(
        quiz.title,
        quiz.questions?.length || 0
      ).catch(err => {
        console.error('Failed to send quiz notification:', err)
      })
    }

    // Audit log - quiz created
    await createAuditLog({
      userId: (req as any).userId,
      action: 'create_quiz',
      entityType: 'quiz',
      entityId: quiz._id.toString(),
      changes: {
        title: quiz.title,
        questionsCount: quiz.questions?.length || 0,
        categoryId: quiz.categoryId,
        topicId: quiz.topicId,
      },
      req,
      status: 'success',
    })

    res.status(201).json(quiz)
  } catch (error: any) {
    console.error('Quiz creation error:', error)
    res.status(400).json({
      error: {
        message: error.message || 'Failed to create quiz',
        details: error.errors || error
      }
    })
  }
}

// НОВЫЙ: Обновление викторины
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('topicId').populate('categoryId') // Populate для возврата полных объектов

    if (!quiz) {
      return res.status(404).json({ error: { message: 'Quiz not found' } })
    }

    // Audit log - quiz updated
    await createAuditLog({
      userId: (req as any).userId,
      action: 'update_quiz',
      entityType: 'quiz',
      entityId: req.params.id,
      changes: req.body,
      req,
      status: 'success',
    })

    res.json(quiz)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to update quiz' } })
  }
}

// НОВЫЙ: Удаление викторины
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id)
    if (!quiz) {
      return res.status(404).json({ error: { message: 'Quiz not found' } })
    }

    // Audit log - quiz deleted
    await createAuditLog({
      userId: (req as any).userId,
      action: 'delete_quiz',
      entityType: 'quiz',
      entityId: req.params.id,
      changes: {
        title: quiz.title,
      },
      req,
      status: 'success',
    })

    res.json({ message: 'Quiz deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete quiz' } })
  }
}