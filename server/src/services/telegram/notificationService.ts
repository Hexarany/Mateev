import bot from './bot'
import User from '../../models/User'
import Group from '../../models/Group'

export class TelegramNotificationService {
  // Send notification to a single user
  static async sendToUser(userId: string, message: string, options?: any) {
    const user = await User.findById(userId)

    if (!user?.telegramId || !user.telegramNotifications?.enabled) {
      return false
    }

    try {
      await bot.telegram.sendMessage(user.telegramId, message, {
        parse_mode: 'Markdown',
        ...options
      })
      return true
    } catch (error) {
      console.error(`Failed to send Telegram notification to user ${userId}:`, error)
      return false
    }
  }

  // Send notification to a group of students
  static async sendToGroup(groupId: string, message: string, options?: any) {
    const group = await Group.findById(groupId).populate('students')
    if (!group) return 0

    let sentCount = 0
    for (const student of group.students as any[]) {
      const sent = await this.sendToUser(student._id.toString(), message, options)
      if (sent) sentCount++
    }

    return sentCount
  }

  // Notify about new content
  static async notifyNewContent(contentType: string, title: string, userIds: string[]) {
    const message = `📚 *Новый ${contentType}!*\n\n${title}\n\nПерейдите на сайт для изучения.`

    let sentCount = 0
    for (const userId of userIds) {
      const sent = await this.sendToUser(userId, message)
      if (sent) sentCount++
    }

    return sentCount
  }

  // Notify all users with enabled notifications about new quiz
  static async notifyNewQuiz(quizTitle: { ru: string; ro: string }, questionsCount: number) {
    try {
      // Find all users with Telegram notifications enabled for new content
      const users = await User.find({
        telegramId: { $exists: true },
        'telegramNotifications.enabled': true,
        'telegramNotifications.newContent': true
      })

      let sentCount = 0
      for (const user of users) {
        const message =
          `📝 *Новый тест!*\n\n` +
          `${quizTitle.ru}\n\n` +
          `Вопросов: ${questionsCount}\n\n` +
          `Пройти тест: /quiz`

        const sent = await this.sendToUser(user._id.toString(), message)
        if (sent) sentCount++

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      console.log(`✅ Quiz notification sent to ${sentCount} users`)
      return sentCount
    } catch (error) {
      console.error('Failed to send quiz notifications:', error)
      return 0
    }
  }
}
