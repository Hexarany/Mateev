import mongoose, { Schema, Document } from 'mongoose'

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId
  plan: 'monthly' | 'yearly'
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: Date
  endDate: Date
  autoRenew: boolean
  paymentMethod?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  amount: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'trial'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  {
    timestamps: true,
  }
)

// Index for quick lookups
SubscriptionSchema.index({ userId: 1, status: 1 })
SubscriptionSchema.index({ endDate: 1 })

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema)
