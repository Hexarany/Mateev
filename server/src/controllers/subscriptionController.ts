import { Request, Response } from 'express'
import { SUBSCRIPTION_PLANS, getPlanById, TRIAL_DURATION_DAYS } from '../config/subscription-plans'
import Subscription from '../models/Subscription'
import User from '../models/User'
import mongoose from 'mongoose'

// GET /api/subscriptions/plans - Получить доступные планы подписок
export const getPlans = async (req: Request, res: Response) => {
  try {
    res.json({
      plans: SUBSCRIPTION_PLANS,
      trialDays: TRIAL_DURATION_DAYS,
    })
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    res.status(500).json({ message: 'Ошибка при получении планов подписок' })
  }
}

// GET /api/subscriptions/current - Получить текущую подписку пользователя
export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    // Получить пользователя и его подписку
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // Найти активную или триальную подписку
    const subscription = await Subscription.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      status: { $in: ['active', 'trial'] },
    }).sort({ createdAt: -1 })

    res.json({
      user: {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
        hasActiveSubscription: user.hasActiveSubscription(),
      },
      subscription: subscription || null,
    })
  } catch (error) {
    console.error('Error fetching current subscription:', error)
    res.status(500).json({ message: 'Ошибка при получении текущей подписки' })
  }
}

// POST /api/subscriptions/start-trial - Начать бесплатный пробный период
export const startTrial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // Проверить, есть ли уже активная подписка или был ли использован триал
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial') {
      return res.status(400).json({ message: 'У вас уже есть активная подписка' })
    }

    // Проверить, использовался ли ранее триал
    const existingTrial = await Subscription.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'trial',
    })

    if (existingTrial) {
      return res.status(400).json({ message: 'Пробный период уже был использован' })
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS)

    // Создать триальную подписку
    const trialSubscription = await Subscription.create({
      userId: new mongoose.Types.ObjectId(userId),
      plan: 'monthly',
      status: 'trial',
      startDate,
      endDate,
      autoRenew: false,
      amount: 0,
      currency: 'USD',
    })

    // Обновить пользователя
    user.subscriptionStatus = 'trial'
    user.subscriptionEndDate = endDate
    await user.save()

    res.status(201).json({
      message: 'Пробный период успешно активирован',
      subscription: trialSubscription,
    })
  } catch (error) {
    console.error('Error starting trial:', error)
    res.status(500).json({ message: 'Ошибка при активации пробного периода' })
  }
}

// POST /api/subscriptions/cancel - Отменить автопродление подписки
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    // Найти активную подписку
    const subscription = await Subscription.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      status: { $in: ['active', 'trial'] },
    }).sort({ createdAt: -1 })

    if (!subscription) {
      return res.status(404).json({ message: 'Активная подписка не найдена' })
    }

    // Отключить автопродление
    subscription.autoRenew = false
    subscription.status = 'cancelled'
    await subscription.save()

    // Обновить статус пользователя
    const user = await User.findById(userId)
    if (user) {
      user.subscriptionStatus = 'cancelled'
      await user.save()
    }

    res.json({
      message: 'Подписка отменена. Доступ сохранится до окончания оплаченного периода',
      subscription,
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    res.status(500).json({ message: 'Ошибка при отмене подписки' })
  }
}

// GET /api/subscriptions/history - Получить историю подписок пользователя
export const getSubscriptionHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    const subscriptions = await Subscription.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 })

    res.json({ subscriptions })
  } catch (error) {
    console.error('Error fetching subscription history:', error)
    res.status(500).json({ message: 'Ошибка при получении истории подписок' })
  }
}

// POST /api/subscriptions/create - Создать новую подписку (будет использоваться с PayPal)
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { planId, paymentMethod, paymentDetails } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    // Проверить план
    const plan = getPlanById(planId)
    if (!plan) {
      return res.status(400).json({ message: 'Недопустимый план подписки' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // Проверить, есть ли уже активная подписка
    const existingSubscription = await Subscription.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      status: { $in: ['active', 'trial'] },
    })

    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(400).json({ message: 'У вас уже есть активная подписка' })
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration)

    // Создать подписку
    const subscription = await Subscription.create({
      userId: new mongoose.Types.ObjectId(userId),
      plan: plan.id,
      status: 'active',
      startDate,
      endDate,
      autoRenew: true,
      paymentMethod: paymentMethod || 'paypal',
      amount: plan.price,
      currency: plan.currency,
      // PayPal specific fields will be added after payment processing
      ...(paymentDetails?.subscriptionId && {
        stripeSubscriptionId: paymentDetails.subscriptionId,
      }),
    })

    // Обновить пользователя
    user.subscriptionStatus = 'active'
    user.subscriptionEndDate = endDate
    await user.save()

    res.status(201).json({
      message: 'Подписка успешно создана',
      subscription,
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    res.status(500).json({ message: 'Ошибка при создании подписки' })
  }
}

// POST /api/subscriptions/check-expired - Проверить и обновить истекшие подписки (cron job)
export const checkExpiredSubscriptions = async (req: Request, res: Response) => {
  try {
    const now = new Date()

    // Найти все истекшие подписки
    const expiredSubscriptions = await Subscription.find({
      status: { $in: ['active', 'trial'] },
      endDate: { $lt: now },
    })

    let updated = 0

    for (const subscription of expiredSubscriptions) {
      subscription.status = 'expired'
      await subscription.save()

      // Обновить пользователя
      const user = await User.findById(subscription.userId)
      if (user) {
        user.subscriptionStatus = 'expired'
        await user.save()
      }

      updated++
    }

    res.json({
      message: `Проверка завершена. Обновлено подписок: ${updated}`,
      updated,
    })
  } catch (error) {
    console.error('Error checking expired subscriptions:', error)
    res.status(500).json({ message: 'Ошибка при проверке истекших подписок' })
  }
}
