import { Request, Response } from 'express'
import GroupFile from '../models/GroupFile'
import Group from '../models/Group'
import Media from '../models/Media'
import { TelegramFileService } from '../services/telegram/fileService'
import TelegramGroupChat from '../models/TelegramGroupChat'

/**
 * Отправить существующий файл группе
 */
export const sendFileToGroup = async (req: Request, res: Response) => {
  try {
    const { groupId, mediaId, title, description } = req.body
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    // Проверяем существование группы и прав доступа
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    // Только учитель группы или админ могут отправлять файлы
    if (userRole !== 'admin' && group.teacher.toString() !== userId) {
      return res
        .status(403)
        .json({ error: { message: 'Нет прав для отправки файлов этой группе' } })
    }

    // Проверяем существование медиа
    const media = await Media.findById(mediaId)
    if (!media) {
      return res.status(404).json({ error: { message: 'Файл не найден' } })
    }

    // Отправляем файл студентам
    const result = await TelegramFileService.sendFileToGroup(
      groupId,
      mediaId,
      title,
      description
    )

    // Проверяем, есть ли связанная Telegram группа
    const telegramGroupChat = await TelegramGroupChat.findOne({
      groupId,
      isActive: true,
    })

    if (telegramGroupChat) {
      // Отправляем файл также в Telegram группу
      await TelegramFileService.sendFileToTelegramGroup(
        result.groupFileId,
        Number(telegramGroupChat.chatId)
      )
    }

    res.json({
      success: true,
      message: `Файл отправлен ${result.successCount} из ${result.totalStudents} студентов`,
      data: {
        groupFileId: result.groupFileId,
        totalStudents: result.totalStudents,
        successCount: result.successCount,
        failedCount: result.failedCount,
        sentToTelegramGroup: !!telegramGroupChat,
      },
    })
  } catch (error: any) {
    console.error('Error sending file to group:', error)
    res.status(500).json({
      error: { message: error.message || 'Ошибка при отправке файла группе' },
    })
  }
}

/**
 * Получить список файлов группы
 */
export const getGroupFiles = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    // Проверяем существование группы
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    // Проверяем права доступа
    const isTeacher = group.teacher.toString() === userId
    const isStudent = group.students.some(
      (s: any) => s.toString() === userId
    )

    if (userRole !== 'admin' && !isTeacher && !isStudent) {
      return res
        .status(403)
        .json({ error: { message: 'Нет доступа к файлам этой группы' } })
    }

    const files = await GroupFile.find({ group: groupId })
      .populate('media')
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })

    // Для студентов скрываем детали доставки
    const responseFiles = files.map((file) => {
      const fileObj = file.toObject()

      if (userRole === 'student') {
        // Студент видит только свой статус доставки
        const ownDelivery = fileObj.deliveryStatus.find(
          (d: any) => d.student.toString() === userId
        )
        return {
          ...fileObj,
          deliveryStatus: ownDelivery ? [ownDelivery] : [],
        }
      }

      return fileObj
    })

    res.json(responseFiles)
  } catch (error) {
    console.error('Error fetching group files:', error)
    res
      .status(500)
      .json({ error: { message: 'Ошибка при получении списка файлов' } })
  }
}

/**
 * Получить детали файла группы
 */
export const getGroupFileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    const groupFile = await GroupFile.findById(id)
      .populate('media')
      .populate('uploadedBy', 'firstName lastName email')
      .populate('group')
      .populate('deliveryStatus.student', 'firstName lastName email')

    if (!groupFile) {
      return res
        .status(404)
        .json({ error: { message: 'Файл группы не найден' } })
    }

    const group = groupFile.group as any

    // Проверяем права доступа
    const isTeacher = group.teacher.toString() === userId
    const isStudent = group.students.some(
      (s: any) => s.toString() === userId
    )

    if (userRole !== 'admin' && !isTeacher && !isStudent) {
      return res
        .status(403)
        .json({ error: { message: 'Нет доступа к этому файлу' } })
    }

    const fileObj = groupFile.toObject()

    // Для студентов показываем только их статус доставки
    if (userRole === 'student') {
      const ownDelivery = fileObj.deliveryStatus.find(
        (d: any) => d.student._id.toString() === userId
      )
      fileObj.deliveryStatus = ownDelivery ? [ownDelivery] : []
    }

    res.json(fileObj)
  } catch (error) {
    console.error('Error fetching group file:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении файла' } })
  }
}

/**
 * Повторная отправка неудачных доставок
 */
export const retryFailedDeliveries = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    const groupFile = await GroupFile.findById(id).populate('group')
    if (!groupFile) {
      return res
        .status(404)
        .json({ error: { message: 'Файл группы не найден' } })
    }

    const group = groupFile.group as any

    // Только учитель группы или админ
    if (userRole !== 'admin' && group.teacher.toString() !== userId) {
      return res.status(403).json({
        error: { message: 'Нет прав для повторной отправки файлов' },
      })
    }

    const result = await TelegramFileService.retryFailedDeliveries(id)

    res.json({
      success: true,
      message: `Повторная отправка выполнена: ${result.successCount} успешно, ${result.stillFailedCount} неудачно`,
      data: result,
    })
  } catch (error: any) {
    console.error('Error retrying deliveries:', error)
    res.status(500).json({
      error: { message: error.message || 'Ошибка при повторной отправке' },
    })
  }
}

/**
 * Удалить файл группы
 */
export const deleteGroupFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    const groupFile = await GroupFile.findById(id).populate('group')
    if (!groupFile) {
      return res
        .status(404)
        .json({ error: { message: 'Файл группы не найден' } })
    }

    const group = groupFile.group as any

    // Только учитель группы или админ
    if (userRole !== 'admin' && group.teacher.toString() !== userId) {
      return res
        .status(403)
        .json({ error: { message: 'Нет прав для удаления файлов' } })
    }

    await GroupFile.findByIdAndDelete(id)

    res.json({
      success: true,
      message: 'Файл группы удален',
    })
  } catch (error) {
    console.error('Error deleting group file:', error)
    res.status(500).json({ error: { message: 'Ошибка при удалении файла' } })
  }
}

/**
 * Получить статистику доставки для группы
 */
export const getGroupDeliveryStats = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    // Проверяем права доступа
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    if (userRole !== 'admin' && group.teacher.toString() !== userId) {
      return res
        .status(403)
        .json({ error: { message: 'Нет доступа к статистике этой группы' } })
    }

    const files = await GroupFile.find({ group: groupId })

    const stats = {
      totalFiles: files.length,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
    }

    files.forEach((file) => {
      file.deliveryStatus.forEach((delivery) => {
        stats.totalDeliveries++
        if (delivery.delivered) {
          stats.successfulDeliveries++
        } else {
          stats.failedDeliveries++
        }
      })
    })

    res.json(stats)
  } catch (error) {
    console.error('Error fetching delivery stats:', error)
    res
      .status(500)
      .json({ error: { message: 'Ошибка при получении статистики' } })
  }
}
