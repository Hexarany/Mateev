import mongoose, { Schema, Document } from 'mongoose'

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]
  type: 'private' | 'group'
  name?: string // Только для групповых чатов
  avatar?: string // Только для групповых чатов
  lastMessage?: {
    content: string
    sender: mongoose.Types.ObjectId
    timestamp: Date
  }
  unreadCount: Map<string, number> // userId -> количество непрочитанных
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ['private', 'group'],
      default: 'private',
      required: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
    },
    lastMessage: {
      content: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date },
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Индекс для быстрого поиска бесед пользователя
conversationSchema.index({ participants: 1, updatedAt: -1 })

// Индекс для поиска приватных бесед между двумя пользователями
conversationSchema.index({ participants: 1, type: 1 })

// Валидация: приватные беседы должны иметь ровно 2 участника
conversationSchema.pre('save', function (next) {
  if (this.type === 'private' && this.participants.length !== 2) {
    next(new Error('Private conversation must have exactly 2 participants'))
  } else {
    next()
  }
})

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema)

export default Conversation
