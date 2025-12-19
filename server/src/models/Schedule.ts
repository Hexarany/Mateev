import mongoose, { Document, Schema } from 'mongoose'

interface IMultiLangText {
  ru: string
  ro: string
}

export interface ISchedule extends Document {
  group: mongoose.Types.ObjectId
  lessonNumber: number
  date: Date
  duration: number // в минутах
  title: IMultiLangText
  description?: IMultiLangText
  topic?: mongoose.Types.ObjectId // ссылка на Topic
  location?: string // например, "Аудитория 305" или "Online"
  status: 'scheduled' | 'completed' | 'cancelled'
  homework?: IMultiLangText
  materials?: string[] // URLs к материалам
  createdAt: Date
  updatedAt: Date
}

const scheduleSchema = new Schema<ISchedule>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],
    },
    lessonNumber: {
      type: Number,
      required: [true, 'Lesson number is required'],
      min: 1,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    duration: {
      type: Number,
      default: 90, // по умолчанию 90 минут
      min: 15,
    },
    title: {
      ru: {
        type: String,
        required: [true, 'Title in Russian is required'],
      },
      ro: {
        type: String,
        required: [true, 'Title in Romanian is required'],
      },
    },
    description: {
      ru: String,
      ro: String,
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
    },
    location: {
      type: String,
      default: 'Online',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    homework: {
      ru: String,
      ro: String,
    },
    materials: [{ type: String }],
  },
  {
    timestamps: true,
  }
)

// Индексы для быстрого поиска
scheduleSchema.index({ group: 1, date: 1 })
scheduleSchema.index({ group: 1, lessonNumber: 1 })
scheduleSchema.index({ date: 1, status: 1 })

// Валидация: убеждаемся, что дата не в прошлом при создании
scheduleSchema.pre('save', function (next) {
  if (this.isNew && this.date < new Date() && this.status === 'scheduled') {
    console.warn(`Warning: Scheduling lesson in the past: ${this.date}`)
  }
  next()
})

const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema)

export default Schedule
