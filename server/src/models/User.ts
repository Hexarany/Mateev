import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  subscriptionStatus: 'none' | 'active' | 'trial' | 'expired' | 'cancelled'
  subscriptionEndDate?: Date
  stripeCustomerId?: string
  createdAt: Date
  updatedAt: Date
  hasActiveSubscription(): boolean
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Пожалуйста, введите корректный email'],
    },
    password: {
      type: String,
      required: [true, 'Пароль обязателен'],
      minlength: [6, 'Пароль должен быть минимум 6 символов'],
    },
    name: {
      type: String,
      required: [true, 'Имя обязательно'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    subscriptionStatus: {
      type: String,
      enum: ['none', 'active', 'trial', 'expired', 'cancelled'],
      default: 'none',
    },
    subscriptionEndDate: {
      type: Date,
    },
    stripeCustomerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Индекс для быстрого поиска по email
userSchema.index({ email: 1 })

// Method to check if user has active subscription
userSchema.methods.hasActiveSubscription = function(): boolean {
  if (this.role === 'admin' || this.role === 'teacher') {
    return true // Admins and teachers always have access
  }

  if (this.subscriptionStatus === 'active') {
    if (this.subscriptionEndDate && this.subscriptionEndDate > new Date()) {
      return true
    }
  }

  if (this.subscriptionStatus === 'trial') {
    if (this.subscriptionEndDate && this.subscriptionEndDate > new Date()) {
      return true
    }
  }

  return false
}

const User = mongoose.model<IUser>('User', userSchema)

export default User
