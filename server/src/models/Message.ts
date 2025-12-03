import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  content: string
  type: 'text' | 'image' | 'file'
  attachments?: {
    url: string
    filename: string
    mimetype: string
    size: number
  }[]
  readBy: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    attachments: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
      },
    ],
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Индекс для быстрого поиска сообщений в беседе
messageSchema.index({ conversationId: 1, createdAt: -1 })

// Индекс для поиска непрочитанных сообщений
messageSchema.index({ conversationId: 1, readBy: 1 })

const Message = mongoose.model<IMessage>('Message', messageSchema)

export default Message
