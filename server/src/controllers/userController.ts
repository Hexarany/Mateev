import { Response } from 'express'
import { CustomRequest } from '../middleware/auth'
import User from '../models/User'

/**
 * Получить настройки email уведомлений текущего пользователя
 */
export const getEmailNotificationSettings = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId

    const user = await User.findById(userId).select('emailNotifications email')

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }

    // Если поле emailNotifications отсутствует, создаем значения по умолчанию
    const emailNotifications = user.emailNotifications || {
      enabled: true,
      homework: true,
      grades: true,
      schedule: true,
    }

    res.json({
      email: user.email,
      emailNotifications,
    })
  } catch (error: any) {
    console.error('Error fetching email notification settings:', error)
    res.status(500).json({ error: { message: 'Server error', details: error.message } })
  }
}

/**
 * Обновить настройки email уведомлений текущего пользователя
 */
export const updateEmailNotificationSettings = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { enabled, homework, grades, schedule } = req.body

    // Валидация: все поля должны быть булевыми
    const validateBoolean = (value: any, fieldName: string) => {
      if (value !== undefined && typeof value !== 'boolean') {
        throw new Error(`${fieldName} must be a boolean value`)
      }
    }

    validateBoolean(enabled, 'enabled')
    validateBoolean(homework, 'homework')
    validateBoolean(grades, 'grades')
    validateBoolean(schedule, 'schedule')

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }

    // Обновляем настройки (обновляем только переданные поля)
    if (!user.emailNotifications) {
      user.emailNotifications = {
        enabled: true,
        homework: true,
        grades: true,
        schedule: true,
      }
    }

    if (enabled !== undefined) user.emailNotifications.enabled = enabled
    if (homework !== undefined) user.emailNotifications.homework = homework
    if (grades !== undefined) user.emailNotifications.grades = grades
    if (schedule !== undefined) user.emailNotifications.schedule = schedule

    await user.save()

    res.json({
      message: 'Email notification settings updated successfully',
      emailNotifications: user.emailNotifications,
    })
  } catch (error: any) {
    console.error('Error updating email notification settings:', error)
    res.status(400).json({ error: { message: error.message || 'Bad request' } })
  }
}
