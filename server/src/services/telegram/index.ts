import bot from './bot'
import { startCommand } from './commands/start'
import { quizCommand } from './commands/quiz'
import { anatomyCommand } from './commands/anatomy'
import { scheduleCommand } from './commands/schedule'
import { initDailyScheduler } from './scheduler'
import { handleQuizCallback } from './handlers/quizCallback'

// Register commands
bot.command('start', startCommand)
bot.command('quiz', quizCommand)
bot.command('anatomy', anatomyCommand)
bot.command('schedule', scheduleCommand)

bot.command('help', (ctx) => {
  return ctx.reply(
    `🤖 *Доступные команды:*\n\n` +
    `/start - Привязать аккаунт\n` +
    `/quiz - Пройти тест\n` +
    `/anatomy <название> - Найти информацию\n` +
    `/schedule - Мои группы\n` +
    `/help - Эта справка`,
    { parse_mode: 'Markdown' }
  )
})

// Register callback query handler for quizzes
bot.on('callback_query', handleQuizCallback)

// Error handling
bot.catch((err, ctx) => {
  console.error('[Telegram Bot] Error:', err)
  ctx.reply('Произошла ошибка. Попробуйте позже.')
})

// Initialize
export async function initTelegramBot() {
  try {
    console.log('🔄 Starting Telegram bot...')

    // Launch bot without timeout - let it take as long as needed
    await bot.launch({
      dropPendingUpdates: true // Skip old updates on startup
    })

    console.log('✅ Telegram bot started successfully')

    // Set up Web App button (non-blocking)
    // Extract production URL from CLIENT_URL (which may contain multiple URLs for CORS)
    const clientUrl = process.env.CLIENT_URL || 'https://anatomia-app-docker.onrender.com'
    const urls = clientUrl.split(',').map(url => url.trim())
    const webAppUrl = urls.find(url => url.startsWith('https://')) || 'https://anatomia-app-docker.onrender.com'

    bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'web_app',
        text: '📚 Открыть Anatomia',
        web_app: { url: webAppUrl }
      }
    })
      .then(() => console.log('✅ Web App menu button configured:', webAppUrl))
      .catch((err: any) => console.error('❌ Failed to set Web App button:', err.message))

    // Initialize daily scheduler
    initDailyScheduler()

    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
  } catch (error: any) {
    console.error('❌ Failed to start Telegram bot:', error.message)
    console.error('Full error:', error)
    console.log('⚠️  Server will continue without Telegram bot')
  }
}
