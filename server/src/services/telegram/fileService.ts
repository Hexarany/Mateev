import bot from './bot'
import User from '../../models/User'
import Group from '../../models/Group'
import GroupFile from '../../models/GroupFile'
import Media from '../../models/Media'
import axios from 'axios'

export class TelegramFileService {
  /**
   * Отправить файл одному пользователю
   */
  static async sendFileToUser(
    userId: string,
    fileUrl: string,
    caption?: string,
    mimetype?: string
  ): Promise<{ success: boolean; error?: string; messageId?: number }> {
    try {
      const user = await User.findById(userId)

      if (!user?.telegramId) {
        return {
          success: false,
          error: 'У пользователя не привязан Telegram аккаунт',
        }
      }

      // Определяем тип файла и отправляем соответствующим методом
      let result
      if (mimetype?.startsWith('image/')) {
        result = await bot.telegram.sendPhoto(user.telegramId, fileUrl, {
          caption,
          parse_mode: 'Markdown',
        })
      } else if (mimetype?.startsWith('video/')) {
        result = await bot.telegram.sendVideo(user.telegramId, fileUrl, {
          caption,
          parse_mode: 'Markdown',
        })
      } else {
        // Для всех остальных типов используем sendDocument
        result = await bot.telegram.sendDocument(user.telegramId, fileUrl, {
          caption,
          parse_mode: 'Markdown',
        })
      }

      return {
        success: true,
        messageId: result.message_id,
      }
    } catch (error: any) {
      console.error(`Failed to send file to user ${userId}:`, error)
      return {
        success: false,
        error: error.message || 'Ошибка при отправке файла',
      }
    }
  }

  /**
   * Отправить файл всем студентам группы
   */
  static async sendFileToGroup(
    groupId: string,
    mediaId: string,
    title?: string,
    description?: string
  ): Promise<{
    groupFileId: string
    totalStudents: number
    successCount: number
    failedCount: number
  }> {
    try {
      // Получаем группу и медиа
      const group = await Group.findById(groupId).populate('students')
      const media = await Media.findById(mediaId)

      if (!group) {
        throw new Error('Группа не найдена')
      }

      if (!media) {
        throw new Error('Файл не найден')
      }

      // Создаем запись GroupFile
      const groupFile = new GroupFile({
        group: groupId,
        media: mediaId,
        uploadedBy: group.teacher,
        title,
        description,
        deliveryStatus: [],
        sentToTelegramGroup: false,
      })

      // Формируем сообщение с информацией о файле
      let caption = ''
      if (title) {
        caption += `📎 *${title}*\n`
      }
      if (description) {
        caption += `\n${description}\n`
      }
      if (caption) {
        caption += `\n---\n`
      }
      caption += `Файл: ${media.originalName}\n`
      caption += `Размер: ${(media.size / 1024 / 1024).toFixed(2)} MB`

      let successCount = 0
      let failedCount = 0

      // Отправляем файл каждому студенту
      const students = group.students as any[]
      for (const student of students) {
        const result = await this.sendFileToUser(
          student._id.toString(),
          media.url,
          caption,
          media.mimetype
        )

        const deliveryRecord = {
          student: student._id,
          delivered: result.success,
          deliveredAt: result.success ? new Date() : undefined,
          error: result.error,
        }

        groupFile.deliveryStatus.push(deliveryRecord)

        if (result.success) {
          successCount++
        } else {
          failedCount++
        }

        // Небольшая задержка для избежания rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      await groupFile.save()

      console.log(
        `✅ File sent to group ${groupId}: ${successCount} success, ${failedCount} failed`
      )

      return {
        groupFileId: groupFile._id.toString(),
        totalStudents: students.length,
        successCount,
        failedCount,
      }
    } catch (error: any) {
      console.error('Failed to send file to group:', error)
      throw error
    }
  }

  /**
   * Повторная отправка файла студентам, которым не удалось доставить
   */
  static async retryFailedDeliveries(groupFileId: string): Promise<{
    successCount: number
    stillFailedCount: number
  }> {
    try {
      const groupFile = await GroupFile.findById(groupFileId).populate('media')

      if (!groupFile) {
        throw new Error('GroupFile не найден')
      }

      const media = groupFile.media as any
      let successCount = 0
      let stillFailedCount = 0

      // Формируем caption
      let caption = ''
      if (groupFile.title) {
        caption += `📎 *${groupFile.title}*\n`
      }
      if (groupFile.description) {
        caption += `\n${groupFile.description}\n`
      }
      if (caption) {
        caption += `\n---\n`
      }
      caption += `Файл: ${media.originalName}\n`
      caption += `Размер: ${(media.size / 1024 / 1024).toFixed(2)} MB`

      // Пытаемся отправить неудачным доставкам
      for (let i = 0; i < groupFile.deliveryStatus.length; i++) {
        const delivery = groupFile.deliveryStatus[i]

        if (!delivery.delivered) {
          const result = await this.sendFileToUser(
            delivery.student.toString(),
            media.url,
            caption,
            media.mimetype
          )

          // Обновляем статус доставки
          groupFile.deliveryStatus[i].delivered = result.success
          groupFile.deliveryStatus[i].deliveredAt = result.success
            ? new Date()
            : undefined
          groupFile.deliveryStatus[i].error = result.error

          if (result.success) {
            successCount++
          } else {
            stillFailedCount++
          }

          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      await groupFile.save()

      return { successCount, stillFailedCount }
    } catch (error: any) {
      console.error('Failed to retry deliveries:', error)
      throw error
    }
  }

  /**
   * Отправить файл в Telegram группу
   */
  static async sendFileToTelegramGroup(
    groupFileId: string,
    chatId: number
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      const groupFile = await GroupFile.findById(groupFileId).populate('media')

      if (!groupFile) {
        return { success: false, error: 'GroupFile не найден' }
      }

      const media = groupFile.media as any

      // Формируем caption
      let caption = ''
      if (groupFile.title) {
        caption += `📎 *${groupFile.title}*\n`
      }
      if (groupFile.description) {
        caption += `\n${groupFile.description}\n`
      }
      if (caption) {
        caption += `\n---\n`
      }
      caption += `Файл: ${media.originalName}\n`
      caption += `Размер: ${(media.size / 1024 / 1024).toFixed(2)} MB`

      let result
      if (media.mimetype?.startsWith('image/')) {
        result = await bot.telegram.sendPhoto(chatId, media.url, {
          caption,
          parse_mode: 'Markdown',
        })
      } else if (media.mimetype?.startsWith('video/')) {
        result = await bot.telegram.sendVideo(chatId, media.url, {
          caption,
          parse_mode: 'Markdown',
        })
      } else {
        result = await bot.telegram.sendDocument(chatId, media.url, {
          caption,
          parse_mode: 'Markdown',
        })
      }

      // Обновляем статус отправки
      groupFile.sentToTelegramGroup = true
      groupFile.telegramMessageId = result.message_id
      await groupFile.save()

      return {
        success: true,
        messageId: result.message_id,
      }
    } catch (error: any) {
      console.error('Failed to send file to Telegram group:', error)
      return {
        success: false,
        error: error.message || 'Ошибка при отправке файла в группу',
      }
    }
  }
}
