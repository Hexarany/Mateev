import { Request, Response } from 'express'
import Quiz from '../models/Quiz'

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
    res.json(quiz)
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
    res.status(201).json(quiz)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to create quiz' } })
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
    res.json({ message: 'Quiz deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete quiz' } })
  }
}