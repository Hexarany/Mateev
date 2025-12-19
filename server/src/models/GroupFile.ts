import mongoose, { Document, Schema } from 'mongoose'

export interface IGroupFile extends Document {
  group: mongoose.Types.ObjectId
  media: mongoose.Types.ObjectId
  uploadedBy: mongoose.Types.ObjectId
  title?: string
  description?: string
  deliveryStatus: {
    student: mongoose.Types.ObjectId
    delivered: boolean
    deliveredAt?: Date
    error?: string
  }[]
  sentToTelegramGroup: boolean
  telegramMessageId?: number
  createdAt: Date
  updatedAt: Date
}

const groupFileSchema = new Schema<IGroupFile>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],
    },
    media: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      required: [true, 'Media is required'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },
    title: {
      type: String,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    deliveryStatus: [
      {
        student: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: {
          type: Date,
        },
        error: {
          type: String,
        },
      },
    ],
    sentToTelegramGroup: {
      type: Boolean,
      default: false,
    },
    telegramMessageId: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
)

// Индексы для быстрого поиска
groupFileSchema.index({ group: 1, createdAt: -1 })
groupFileSchema.index({ uploadedBy: 1 })
groupFileSchema.index({ 'deliveryStatus.student': 1 })

const GroupFile = mongoose.model<IGroupFile>('GroupFile', groupFileSchema)

export default GroupFile
