import mongoose, { Document, Schema } from 'mongoose'

export interface IPromoCode extends Document {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses: number
  currentUses: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
  applicableTo: {
    tiers?: string[] // какие тарифы
    userGroups?: string[] // какие группы пользователей
  }
  usedBy: Array<{
    userId: mongoose.Types.ObjectId
    usedAt: Date
  }>
  createdBy: mongoose.Types.ObjectId
  metadata?: {
    description?: string
    campaign?: string
  }
  // Methods
  isValid(userId?: string, tier?: string): { valid: boolean; message?: string }
  apply(userId: string): Promise<void>
  calculateDiscount(originalPrice: number): number
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxUses: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    currentUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    applicableTo: {
      tiers: {
        type: [String],
        default: [],
      },
      userGroups: {
        type: [String],
        default: [],
      },
    },
    usedBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      description: String,
      campaign: String,
    },
  },
  {
    timestamps: true,
  }
)

// Метод для проверки валидности промокода
PromoCodeSchema.methods.isValid = function (userId?: string, tier?: string): { valid: boolean; message?: string } {
  const now = new Date()

  // Проверка активности
  if (!this.isActive) {
    return { valid: false, message: 'Promo code is inactive' }
  }

  // Проверка даты
  if (now < this.validFrom) {
    return { valid: false, message: 'Promo code is not yet valid' }
  }

  if (now > this.validUntil) {
    return { valid: false, message: 'Promo code has expired' }
  }

  // Проверка лимита использований
  if (this.currentUses >= this.maxUses) {
    return { valid: false, message: 'Promo code usage limit exceeded' }
  }

  // Проверка, использовал ли пользователь этот код
  if (userId && this.usedBy.some((usage: any) => usage.userId.toString() === userId)) {
    return { valid: false, message: 'You have already used this promo code' }
  }

  // Проверка применимости к тарифу
  if (tier && this.applicableTo.tiers && this.applicableTo.tiers.length > 0) {
    if (!this.applicableTo.tiers.includes(tier)) {
      return { valid: false, message: 'Promo code is not applicable to this tier' }
    }
  }

  return { valid: true }
}

// Метод для применения промокода
PromoCodeSchema.methods.apply = async function (userId: string) {
  this.currentUses += 1
  this.usedBy.push({
    userId: new mongoose.Types.ObjectId(userId),
    usedAt: new Date(),
  })
  await this.save()
}

// Метод для расчета скидки
PromoCodeSchema.methods.calculateDiscount = function (originalPrice: number): number {
  if (this.discountType === 'percentage') {
    const discount = (originalPrice * this.discountValue) / 100
    return Math.min(discount, originalPrice) // Не может быть больше оригинальной цены
  } else {
    return Math.min(this.discountValue, originalPrice) // Фиксированная скидка
  }
}

export default mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema)
