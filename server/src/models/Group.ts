import mongoose, { Schema, Document } from 'mongoose'

export interface IGroup extends Document {
  name: { ru: string; ro: string }
  description?: { ru: string; ro: string }
  teacher: mongoose.Types.ObjectId
  students: mongoose.Types.ObjectId[]
  startDate: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const GroupSchema = new Schema<IGroup>({
  name: {
    ru: { type: String, required: true },
    ro: { type: String, required: true }
  },
  description: {
    ru: { type: String },
    ro: { type: String }
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model<IGroup>('Group', GroupSchema)
