import mongoose, { Document, Schema } from 'mongoose'

export type NotificationType =
  | 'achievement_unlocked'
  | 'certificate_ready'
  | 'new_content'
  | 'quiz_reminder'
  | 'course_completed'
  | 'system_announcement'
  | 'assignment_graded'
  | 'comment_reply'
  | 'new_message'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: NotificationType
  title: {
    ru: string
    ro: string
  }
  message: {
    ru: string
    ro: string
  }
  icon?: string
  actionUrl?: string
  actionText?: {
    ru: string
    ro: string
  }
  metadata?: {
    achievementId?: string
    certificateId?: string
    topicId?: string
    quizId?: string
    assignmentId?: string
    [key: string]: any
  }
  isRead: boolean
  readAt?: Date
  sentAt: Date
  emailSent: boolean
  emailSentAt?: Date
  priority: 'low' | 'normal' | 'high'
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'achievement_unlocked',
        'certificate_ready',
        'new_content',
        'quiz_reminder',
        'course_completed',
        'system_announcement',
        'assignment_graded',
        'comment_reply',
        'new_message',
      ],
      required: true,
    },
    title: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    message: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    icon: {
      type: String,
    },
    actionUrl: {
      type: String,
    },
    actionText: {
      ru: { type: String },
      ro: { type: String },
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, sentAt: -1 })
NotificationSchema.index({ userId: 1, type: 1 })
NotificationSchema.index({ sentAt: -1 })

// Auto-delete old read notifications after 90 days
NotificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 7776000 }) // 90 days

export default mongoose.model<INotification>('Notification', NotificationSchema)
