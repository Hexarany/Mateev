import { Telegraf, Context } from 'telegraf'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// Only initialize bot if token is provided
let bot: Telegraf | null = null

if (BOT_TOKEN) {
  bot = new Telegraf(BOT_TOKEN)

  // Middleware for logging
  bot.use(async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    console.log(`[Telegram Bot] ${ctx.updateType} processed in ${ms}ms`)
  })
} else {
  console.warn('⚠️  TELEGRAM_BOT_TOKEN not set, Telegram bot will not be initialized')
}

// Export for use in other modules
export { bot }
export default bot
