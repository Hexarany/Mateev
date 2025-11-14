import { Request, Response } from 'express'
import { getPlanById } from '../config/subscription-plans'
import { createPayPalOrder, capturePayPalPayment, getPayPalOrderDetails } from '../services/paypalService'
import Subscription from '../models/Subscription'
import User from '../models/User'
import mongoose from 'mongoose'

// POST /api/paypal/create-order - Создать PayPal заказ
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { planId } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    // Проверить план
    const plan = getPlanById(planId)
    if (!plan) {
      return res.status(400).json({ message: 'Недопустимый план подписки' })
    }

    // Создать заказ PayPal
    const order = await createPayPalOrder(
      plan.price,
      plan.currency,
      plan.name.ru // или выбрать по языку пользователя
    )

    // Сохранить информацию о заказе для последующего использования
    res.json({
      orderId: order.id,
      approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href,
      order,
    })
  } catch (error: any) {
    console.error('Error creating PayPal order:', error)
    res.status(500).json({
      message: 'Ошибка при создании заказа PayPal',
      error: error.message
    })
  }
}

// POST /api/paypal/capture-order - Завершить платеж PayPal
export const captureOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { orderId, planId } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    if (!orderId) {
      return res.status(400).json({ message: 'ID заказа обязателен' })
    }

    // Получить пользователя
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // Получить план
    const plan = getPlanById(planId)
    if (!plan) {
      return res.status(400).json({ message: 'Недопустимый план подписки' })
    }

    // Завершить платеж в PayPal
    const captureData = await capturePayPalPayment(orderId)

    // Проверить статус платежа
    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({
        message: 'Платеж не завершен',
        status: captureData.status
      })
    }

    // Получить детали платежа
    const paymentDetails = captureData.purchase_units[0].payments.captures[0]
    const payerId = captureData.payer.payer_id
    const payerEmail = captureData.payer.email_address

    // Создать подписку в базе данных
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration)

    const subscription = await Subscription.create({
      userId: new mongoose.Types.ObjectId(userId),
      plan: plan.id,
      status: 'active',
      startDate,
      endDate,
      autoRenew: false, // PayPal recurring subscriptions would be implemented separately
      paymentMethod: 'paypal',
      stripeCustomerId: payerId, // Используем для хранения PayPal payer ID
      stripeSubscriptionId: orderId, // Используем для хранения PayPal order ID
      amount: plan.price,
      currency: plan.currency,
    })

    // Обновить пользователя
    user.subscriptionStatus = 'active'
    user.subscriptionEndDate = endDate
    await user.save()

    res.json({
      message: 'Подписка успешно активирована',
      subscription,
      paymentDetails: {
        orderId: captureData.id,
        paymentId: paymentDetails.id,
        amount: paymentDetails.amount.value,
        currency: paymentDetails.amount.currency_code,
        status: captureData.status,
      },
    })
  } catch (error: any) {
    console.error('Error capturing PayPal payment:', error)
    res.status(500).json({
      message: 'Ошибка при завершении платежа PayPal',
      error: error.message
    })
  }
}

// GET /api/paypal/order/:orderId - Получить детали заказа PayPal
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { orderId } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    if (!orderId) {
      return res.status(400).json({ message: 'ID заказа обязателен' })
    }

    // Получить детали заказа из PayPal
    const orderDetails = await getPayPalOrderDetails(orderId)

    res.json({ order: orderDetails })
  } catch (error: any) {
    console.error('Error getting PayPal order details:', error)
    res.status(500).json({
      message: 'Ошибка при получении деталей заказа',
      error: error.message
    })
  }
}

// POST /api/paypal/webhook - Обработать PayPal webhook (для автоматических уведомлений)
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const webhookEvent = req.body

    console.log('PayPal webhook received:', webhookEvent.event_type)

    // Обработать различные типы событий
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Платеж успешно завершен
        console.log('Payment captured:', webhookEvent.resource.id)
        break

      case 'PAYMENT.CAPTURE.DENIED':
        // Платеж отклонен
        console.log('Payment denied:', webhookEvent.resource.id)
        break

      case 'PAYMENT.CAPTURE.REFUNDED':
        // Платеж возвращен
        console.log('Payment refunded:', webhookEvent.resource.id)
        // Обновить статус подписки
        break

      default:
        console.log('Unhandled webhook event:', webhookEvent.event_type)
    }

    // Всегда возвращаем 200 для подтверждения получения webhook
    res.status(200).json({ received: true })
  } catch (error: any) {
    console.error('Error handling PayPal webhook:', error)
    res.status(500).json({
      message: 'Ошибка при обработке webhook',
      error: error.message
    })
  }
}
