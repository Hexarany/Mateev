import mongoose, { Document, Schema } from 'mongoose'

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId | null
  userEmail?: string
  action: string // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', etc.
  entityType: string // 'User', 'Topic', 'Quiz', 'Group', etc.
  entityId?: string
  changes?: {
    field: string
    oldValue?: any
    newValue?: any
  }[]
  metadata?: {
    ip?: string
    userAgent?: string
    [key: string]: any
  }
  timestamp: Date
  status: 'success' | 'failure'
  errorMessage?: string
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
)

// Индексы для эффективного поиска
auditLogSchema.index({ timestamp: -1 })
auditLogSchema.index({ userId: 1, timestamp: -1 })
auditLogSchema.index({ entityType: 1, entityId: 1 })
auditLogSchema.index({ action: 1, timestamp: -1 })

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema)

export default AuditLog
