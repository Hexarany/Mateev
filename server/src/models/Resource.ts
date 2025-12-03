import mongoose, { Document } from 'mongoose'

export interface IResource extends Document {
  title: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  type: 'pdf' | 'doc' | 'book' | 'article' | 'link' | 'video'
  category: string
  fileUrl?: string
  externalUrl?: string
  thumbnail?: string
  fileSize?: number
  fileName?: string
  author?: string
  publishedYear?: number
  accessLevel: 'free' | 'basic' | 'premium'
  downloads: number
  tags: string[]
  uploadedBy: mongoose.Types.ObjectId
  isPublished: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const resourceSchema = new mongoose.Schema<IResource>(
  {
    title: {
      ru: {
        type: String,
        required: true,
        maxlength: 300,
      },
      ro: {
        type: String,
        required: true,
        maxlength: 300,
      },
    },
    description: {
      ru: {
        type: String,
        required: true,
        maxlength: 2000,
      },
      ro: {
        type: String,
        required: true,
        maxlength: 2000,
      },
    },
    type: {
      type: String,
      required: true,
      enum: ['pdf', 'doc', 'book', 'article', 'link', 'video'],
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    fileUrl: {
      type: String,
    },
    externalUrl: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    fileName: {
      type: String,
    },
    author: {
      type: String,
      maxlength: 200,
    },
    publishedYear: {
      type: Number,
    },
    accessLevel: {
      type: String,
      required: true,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
      index: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

resourceSchema.index({ category: 1, isPublished: 1, order: 1 })
resourceSchema.index({ type: 1, isPublished: 1 })
resourceSchema.index({ accessLevel: 1, isPublished: 1 })
resourceSchema.index({ tags: 1, isPublished: 1 })

export default mongoose.model<IResource>('Resource', resourceSchema)
