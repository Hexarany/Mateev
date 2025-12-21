import { Context } from 'telegraf'
import { Markup } from 'telegraf'
import User from '../../../models/User'
import Assignment from '../../../models/Assignment'
import Submission from '../../../models/Submission'
import mongoose from 'mongoose'

/**
 * Команда /homework - показать список домашних заданий
 */
export async function homeworkCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      '❌ *Аккаунт не привязан*\n\n' +
      'Используйте команду /start для привязки аккаунта.',
      { parse_mode: 'Markdown' }
    )
  }

  try {
    // Получаем все задания для групп студента
    const submissions = await Submission.find({ student: user._id })
      .populate({
        path: 'assignment',
        populate: { path: 'group', select: 'name' }
      })
      .sort({ 'assignment.deadline': 1 })
      .lean()

    // Получаем ID заданий, которые уже сданы
    const submittedAssignmentIds = submissions.map(s => s.assignment._id)

    // Находим все группы: где пользователь студент, преподаватель, или админ
    const Group = (await import('../../../models/Group')).default
    const groupQuery: any = { isActive: true }

    // Если не админ, ограничиваем группы
    if (user.role !== 'admin') {
      groupQuery.$or = [
        { students: user._id },  // Пользователь - студент
        { teacher: user._id }     // Пользователь - преподаватель
      ]
    }

    const userGroups = await Group.find(groupQuery).select('_id').lean()
    const groupIds = userGroups.map(g => g._id)

    // Получаем все активные задания для групп студента
    const allAssignments = await Assignment.find({
      group: { $in: groupIds },
      deadline: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // За последний месяц
    })
      .populate('group', 'name')
      .sort({ deadline: 1 })
      .lean()

    // Разделяем на активные и завершенные
    const now = new Date()
    const activeAssignments = allAssignments.filter(
      a => !submittedAssignmentIds.some(id => id.toString() === a._id.toString()) &&
           new Date(a.deadline) > now
    )
    const completedSubmissions = submissions.filter(s => s.status === 'graded')

    if (activeAssignments.length === 0 && completedSubmissions.length === 0) {
      return ctx.reply(
        '📚 *Домашние задания*\n\n' +
        'У вас пока нет активных заданий.',
        { parse_mode: 'Markdown' }
      )
    }

    let response = '📚 *Домашние задания*\n\n'

    // Активные задания
    const buttons: any[] = []

    if (activeAssignments.length > 0) {
      response += '📝 *Активные:*\n\n'
      activeAssignments.forEach((assignment, index) => {
        const deadline = new Date(assignment.deadline)
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const urgency = daysLeft <= 1 ? '🔴' : daysLeft <= 3 ? '🟡' : '🟢'

        response += `${urgency} *${assignment.title.ru}*\n`
        response += `Группа: ${(assignment.group as any).name.ru}\n`
        response += `Дедлайн: ${deadline.toLocaleDateString('ru-RU')} ${deadline.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n`
        response += `Осталось: ${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}\n`
        response += `ID: \`${assignment._id}\`\n\n`

        // Добавляем кнопку для каждого задания
        if (index < 5) { // Ограничиваем до 5 кнопок
          buttons.push([
            Markup.button.callback(
              `✍️ Сдать: ${assignment.title.ru.substring(0, 25)}...`,
              `submit_${assignment._id}`
            )
          ])
        }
      })
    }

    // Завершенные задания с оценками
    if (completedSubmissions.length > 0) {
      response += '✅ *Проверенные (последние 5):*\n\n'
      completedSubmissions.slice(0, 5).forEach(sub => {
        const assignment = sub.assignment as any
        response += `*${assignment.title.ru}*\n`
        response += `Оценка: ${sub.grade}/${assignment.maxScore}\n`
        if (sub.feedback) {
          response += `Комментарий: ${sub.feedback.substring(0, 100)}${sub.feedback.length > 100 ? '...' : ''}\n`
        }
        response += '\n'
      })
    }

    response += '\n_Для сдачи работы используйте:_\n'
    response += '`/submit <ID> <текст или файл>`'

    // Добавляем кнопку возврата в главное меню
    buttons.push([Markup.button.callback('🏠 Главное меню', 'main_menu')])

    return ctx.reply(response, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    })
  } catch (error) {
    console.error('[Telegram] Error in homeworkCommand:', error)
    return ctx.reply('❌ Произошла ошибка при получении списка заданий.')
  }
}

/**
 * Команда /submit - сдать домашнее задание
 * Использование:
 * - Текст: /submit <assignment_id> <ответ>
 * - Файл: Отправить файл с подписью /submit <assignment_id>
 */
export async function submitCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      '❌ *Аккаунт не привязан*\n\n' +
      'Используйте команду /start для привязки аккаунта.',
      { parse_mode: 'Markdown' }
    )
  }

  const message = ctx.message as any
  let assignmentId = ''
  let answer = ''
  let fileUrl: string | null = null

  // Проверяем, есть ли файл (фото или документ)
  if (message?.photo || message?.document) {
    // Файл с подписью: /submit <ID>
    const caption = message.caption || ''
    const captionArgs = caption.split(' ').slice(1) // Убираем /submit

    if (captionArgs.length < 1) {
      return ctx.reply(
        '❌ *Неверный формат*\n\n' +
        'При отправке файла используйте подпись:\n' +
        '`/submit <ID задания>`\n\n' +
        'ID можно получить командой /homework',
        { parse_mode: 'Markdown' }
      )
    }

    assignmentId = captionArgs[0]

    // Получаем информацию о файле
    try {
      let fileId: string
      let fileName: string

      if (message.photo) {
        // Берем фото наибольшего размера
        const photo = message.photo[message.photo.length - 1]
        fileId = photo.file_id
        fileName = `photo_${Date.now()}.jpg`
      } else {
        fileId = message.document.file_id
        fileName = message.document.file_name || `document_${Date.now()}`
      }

      // Получаем ссылку на файл от Telegram
      const fileLink = await ctx.telegram.getFileLink(fileId)
      fileUrl = fileLink.href
      answer = `Файл: ${fileName}`
    } catch (error) {
      console.error('[Telegram] Error getting file:', error)
      return ctx.reply('❌ Ошибка при обработке файла.')
    }
  } else {
    // Текстовый ответ: /submit <ID> <текст>
    const text = (message && 'text' in message) ? message.text : ''
    const args = text.split(' ').slice(1) // Убираем /submit

    if (args.length < 2) {
      return ctx.reply(
        '❌ *Неверный формат команды*\n\n' +
        '*Текстовый ответ:*\n' +
        '`/submit <ID задания> <ваш ответ>`\n\n' +
        '*Файл:*\n' +
        'Отправьте файл или фото с подписью:\n' +
        '`/submit <ID задания>`\n\n' +
        '*Пример:*\n' +
        '`/submit 507f1f77bcf86cd799439011 Мышца начинается от...`\n\n' +
        'Для получения ID используйте команду /homework',
        { parse_mode: 'Markdown' }
      )
    }

    assignmentId = args[0]
    answer = args.slice(1).join(' ')
  }

  // Проверяем валидность ID
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return ctx.reply('❌ Неверный ID задания. Используйте /homework для получения списка.')
  }

  try {
    // Проверяем существование задания
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return ctx.reply('❌ Задание не найдено.')
    }

    // Проверяем дедлайн
    const now = new Date()
    const isLate = now > assignment.deadline

    if (isLate && !assignment.allowLateSubmission) {
      return ctx.reply(
        '❌ *Дедлайн прошёл*\n\n' +
        'К сожалению, срок сдачи этого задания истёк.',
        { parse_mode: 'Markdown' }
      )
    }

    // Проверяем, не сдано ли уже
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: user._id
    })

    if (existingSubmission) {
      return ctx.reply(
        '❌ *Вы уже сдали это задание*\n\n' +
        'Для повторной сдачи используйте веб-интерфейс.',
        { parse_mode: 'Markdown' }
      )
    }

    // Создаём сдачу
    const submissionData: any = {
      assignment: assignmentId,
      student: user._id,
      textAnswer: answer,
      files: fileUrl ? [fileUrl] : [],
      status: isLate ? 'late' : 'submitted',
      isLate,
      submittedAt: new Date()
    }

    const submission = new Submission(submissionData)
    await submission.save()

    let response = '✅ *Работа сдана успешно!*\n\n'
    response += `*Задание:* ${assignment.title.ru}\n`

    if (fileUrl) {
      response += `📎 *Файл:* ${answer}\n`
    } else {
      response += `*Ваш ответ:* ${answer.substring(0, 200)}${answer.length > 200 ? '...' : ''}\n`
    }

    if (isLate) {
      response += '\n⚠️ Работа сдана с опозданием'
    }

    return ctx.reply(response, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[Telegram] Error in submitCommand:', error)
    return ctx.reply('❌ Произошла ошибка при сдаче работы.')
  }
}

/**
 * Команда /resubmit - повторная сдача работы
 * Использование: /resubmit <assignment_id> <новый ответ>
 */
export async function resubmitCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      '❌ *Аккаунт не привязан*\n\n' +
      'Используйте команду /start для привязки аккаунта.',
      { parse_mode: 'Markdown' }
    )
  }

  const message = ctx.message as any
  let assignmentId = ''
  let answer = ''
  let fileUrl: string | null = null

  // Проверяем, есть ли файл
  if (message?.photo || message?.document) {
    const caption = message.caption || ''
    const captionArgs = caption.split(' ').slice(1)

    if (captionArgs.length < 1) {
      return ctx.reply(
        '❌ *Неверный формат*\n\n' +
        'При отправке файла используйте подпись:\n' +
        '`/resubmit <ID задания>`',
        { parse_mode: 'Markdown' }
      )
    }

    assignmentId = captionArgs[0]

    try {
      let fileId: string
      let fileName: string

      if (message.photo) {
        const photo = message.photo[message.photo.length - 1]
        fileId = photo.file_id
        fileName = `photo_${Date.now()}.jpg`
      } else {
        fileId = message.document.file_id
        fileName = message.document.file_name || `document_${Date.now()}`
      }

      const fileLink = await ctx.telegram.getFileLink(fileId)
      fileUrl = fileLink.href
      answer = `Файл: ${fileName}`
    } catch (error) {
      console.error('[Telegram] Error getting file:', error)
      return ctx.reply('❌ Ошибка при обработке файла.')
    }
  } else {
    const text = (message && 'text' in message) ? message.text : ''
    const args = text.split(' ').slice(1)

    if (args.length < 2) {
      return ctx.reply(
        '❌ *Неверный формат команды*\n\n' +
        '*Текстовый ответ:*\n' +
        '`/resubmit <ID задания> <новый ответ>`\n\n' +
        '*Файл:*\n' +
        'Отправьте файл с подписью:\n' +
        '`/resubmit <ID задания>`\n\n' +
        'Для получения ID используйте /homework',
        { parse_mode: 'Markdown' }
      )
    }

    assignmentId = args[0]
    answer = args.slice(1).join(' ')
  }

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return ctx.reply('❌ Неверный ID задания.')
  }

  try {
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return ctx.reply('❌ Задание не найдено.')
    }

    // Найти существующую сдачу
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: user._id
    })

    if (!existingSubmission) {
      return ctx.reply(
        '❌ *Вы еще не сдавали это задание*\n\n' +
        'Используйте `/submit` для первой сдачи.',
        { parse_mode: 'Markdown' }
      )
    }

    // Обновляем сдачу
    existingSubmission.textAnswer = answer
    existingSubmission.files = fileUrl ? [fileUrl] : existingSubmission.files
    existingSubmission.status = 'submitted'
    existingSubmission.submittedAt = new Date()
    existingSubmission.grade = undefined
    existingSubmission.feedback = undefined
    existingSubmission.gradedBy = undefined
    existingSubmission.gradedAt = undefined

    await existingSubmission.save()

    let response = '✅ *Работа пересдана успешно!*\n\n'
    response += `*Задание:* ${assignment.title.ru}\n`

    if (fileUrl) {
      response += `📎 *Файл:* ${answer}\n`
    } else {
      response += `*Новый ответ:* ${answer.substring(0, 200)}${answer.length > 200 ? '...' : ''}\n`
    }

    response += '\n_Предыдущая оценка сброшена. Ждите новой проверки._'

    return ctx.reply(response, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[Telegram] Error in resubmitCommand:', error)
    return ctx.reply('❌ Произошла ошибка при пересдаче работы.')
  }
}

/**
 * Команда /grades - показать оценки
 */
export async function gradesCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      '❌ *Аккаунт не привязан*\n\n' +
      'Используйте команду /start для привязки аккаунта.',
      { parse_mode: 'Markdown' }
    )
  }

  try {
    // Получаем все оценки студента
    const submissions = await Submission.find({
      student: user._id,
      status: 'graded'
    })
      .populate({
        path: 'assignment',
        populate: { path: 'group', select: 'name' }
      })
      .sort({ gradedAt: -1 })
      .limit(10)
      .lean()

    if (submissions.length === 0) {
      return ctx.reply(
        '📊 *Оценки*\n\n' +
        'У вас пока нет проверенных работ.',
        { parse_mode: 'Markdown' }
      )
    }

    let response = '📊 *Ваши оценки (последние 10):*\n\n'

    let totalScore = 0
    let maxPossibleScore = 0

    submissions.forEach((sub, index) => {
      const assignment = sub.assignment as any
      const scorePercent = Math.round((sub.grade! / assignment.maxScore) * 100)
      const emoji = scorePercent >= 90 ? '🌟' : scorePercent >= 75 ? '✅' : scorePercent >= 60 ? '📝' : '📌'

      response += `${emoji} *${assignment.title.ru}*\n`
      response += `Группа: ${assignment.group.name.ru}\n`
      response += `Оценка: *${sub.grade}/${assignment.maxScore}* (${scorePercent}%)\n`

      if (sub.feedback) {
        response += `💬 ${sub.feedback.substring(0, 100)}${sub.feedback.length > 100 ? '...' : ''}\n`
      }

      response += `Проверено: ${new Date(sub.gradedAt!).toLocaleDateString('ru-RU')}\n\n`

      totalScore += sub.grade!
      maxPossibleScore += assignment.maxScore
    })

    // Общая статистика
    const averagePercent = Math.round((totalScore / maxPossibleScore) * 100)
    response += `📈 *Общая статистика:*\n`
    response += `Средний балл: ${averagePercent}%\n`
    response += `Всего баллов: ${totalScore}/${maxPossibleScore}`

    return ctx.reply(response, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[Telegram] Error in gradesCommand:', error)
    return ctx.reply('❌ Произошла ошибка при получении оценок.')
  }
}
