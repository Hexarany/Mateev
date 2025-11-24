import mongoose, { Schema, Document } from 'mongoose'

interface IMultiLangText {
  ru: string
  ro: string
}

interface IMediaFile {
  url: string
  filename: string
  caption?: IMultiLangText
  type: 'image' | 'video'
}

export interface ITriggerPoint extends Document {
  name: IMultiLangText
  muscle: string // Название мышцы
  location: IMultiLangText // Локализация точки
  symptoms: IMultiLangText // Симптомы/боль
  referralPattern: IMultiLangText // Паттерн иррадиации боли
  technique: IMultiLangText // Техника массажа
  contraindications?: IMultiLangText // Противопоказания
  images: IMediaFile[] // Диаграммы с точками
  videos: IMediaFile[] // Видео техники
  model3D?: string // URL к 3D модели мышцы
  category: 'head_neck' | 'shoulder_arm' | 'back' | 'chest' | 'hip_leg' | 'other' // Часть тела
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  slug: string
  order: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const TriggerPointSchema: Schema = new Schema(
  {
    name: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    muscle: {
      type: String,
      required: true,
    },
    location: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    symptoms: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    referralPattern: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    technique: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    contraindications: {
      ru: { type: String },
      ro: { type: String },
    },
    images: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        caption: {
          ru: String,
          ro: String,
        },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
      },
    ],
    videos: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        caption: {
          ru: String,
          ro: String,
        },
        type: { type: String, enum: ['image', 'video'], default: 'video' },
      },
    ],
    model3D: { type: String },
    category: {
      type: String,
      enum: ['head_neck', 'shoulder_arm', 'back', 'chest', 'hip_leg', 'other'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    slug: { type: String, unique: true, sparse: true },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

// Автоматическое создание slug из названия на русском
TriggerPointSchema.pre<ITriggerPoint>('save', function (next) {
  if (!this.slug && (this.name as IMultiLangText).ru) {
    const transliterate = require('transliteration').transliterate
    this.slug = transliterate((this.name as IMultiLangText).ru)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  next()
})

// Индексы для быстрого поиска
TriggerPointSchema.index({ category: 1, order: 1 })
TriggerPointSchema.index({ muscle: 1 })
TriggerPointSchema.index({ slug: 1 })

export default mongoose.model<ITriggerPoint>('TriggerPoint', TriggerPointSchema)
