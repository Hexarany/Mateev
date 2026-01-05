import { Request, Response } from 'express'
import Resource from '../models/Resource'
import User from '../models/User'
import { createAuditLog } from '../services/auditLogService'

interface CustomRequest extends Request {
  userId?: string
  userRole?: string
  user?: any
}

// Helper: Check if user has access to resource based on tier
const hasAccessToResource = async (
  resource: any,
  userId: string | undefined,
  userRole: string | undefined
): Promise<{ hasAccess: boolean; userAccessLevel: string; requiredTier: string }> => {
  // Admins and teachers have full access
  if (userRole === 'admin' || userRole === 'teacher') {
    return { hasAccess: true, userAccessLevel: 'premium', requiredTier: resource.accessLevel }
  }

  // Get user access level
  let userAccessLevel: 'free' | 'basic' | 'premium' = 'free'
  if (userId) {
    const user = await User.findById(userId)
    userAccessLevel = user?.accessLevel || 'free'
  }

  const requiredTier = resource.accessLevel || 'free'

  // Check tier hierarchy
  const tierHierarchy: { [key: string]: number } = { free: 0, basic: 1, premium: 2 }
  const userLevel = tierHierarchy[userAccessLevel]
  const requiredLevel = tierHierarchy[requiredTier]

  const hasAccess = userLevel >= requiredLevel

  return { hasAccess, userAccessLevel, requiredTier }
}

// Helper: Apply content lock
const createSafeResource = (
  resource: any,
  hasAccess: boolean,
  userAccessLevel: string,
  requiredTier: string
) => {
  if (hasAccess) {
    return {
      ...resource,
      hasFullContentAccess: true,
      accessInfo: {
        hasFullAccess: true,
        userAccessLevel,
        requiredTier,
      },
    }
  }

  // Limited access - hide file URLs and truncate description
  const previewDescriptionRu = resource.description?.ru
    ? resource.description.ru.substring(0, 400) + '...'
    : ''
  const previewDescriptionRo = resource.description?.ro
    ? resource.description.ro.substring(0, 400) + '...'
    : ''

  return {
    ...resource,
    fileUrl: null, // Hide file URL for users without access
    externalUrl: null, // Hide external URL
    description: {
      ru: previewDescriptionRu,
      ro: previewDescriptionRo,
    },
    hasFullContentAccess: false,
    accessInfo: {
      hasFullAccess: false,
      userAccessLevel,
      requiredTier,
    },
  }
}

// Получить все ресурсы (с фильтрами)
export const getResources = async (req: Request, res: Response) => {
  try {
    const { category, type, accessLevel, tag, search } = req.query

    const filter: any = { isPublished: true }
    if (category) filter.category = category
    if (type) filter.type = type
    if (accessLevel) filter.accessLevel = accessLevel
    if (tag) filter.tags = tag

    if (search && typeof search === 'string') {
      filter.$or = [
        { 'title.ru': new RegExp(search, 'i') },
        { 'title.ro': new RegExp(search, 'i') },
        { 'description.ru': new RegExp(search, 'i') },
        { 'description.ro': new RegExp(search, 'i') },
      ]
    }

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'firstName lastName')
      .sort({ order: 1, createdAt: -1 })
      .lean()

    // Apply tier-based access control to each resource
    const customReq = req as CustomRequest

    // Get user access level once
    let userAccessLevel: 'free' | 'basic' | 'premium' = 'free'
    const userRole = customReq.userRole

    if (userRole === 'admin' || userRole === 'teacher') {
      userAccessLevel = 'premium'
    } else if (customReq.userId) {
      const user = await User.findById(customReq.userId)
      userAccessLevel = user?.accessLevel || 'free'
    }

    const tierHierarchy: { [key: string]: number } = { free: 0, basic: 1, premium: 2 }
    const userLevel = tierHierarchy[userAccessLevel]

    // Apply access control to each resource
    const safeResources = resources.map((resource) => {
      const requiredTier = resource.accessLevel || 'free'
      const requiredLevel = tierHierarchy[requiredTier]
      const hasAccess = userLevel >= requiredLevel

      return createSafeResource(resource, hasAccess, userAccessLevel, requiredTier)
    })

    res.json(safeResources)
  } catch (error) {
    console.error('Get resources error:', error)
    res.status(500).json({ message: 'Failed to get resources' })
  }
}

// Получить ресурс по ID
export const getResourceById = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params

    const resource = await Resource.findOne({ _id: resourceId, isPublished: true })
      .populate('uploadedBy', 'firstName lastName')
      .lean()

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    // Apply tier-based access control
    const customReq = req as CustomRequest
    const accessInfo = await hasAccessToResource(resource, customReq.userId, customReq.userRole)

    const safeResource = createSafeResource(
      resource,
      accessInfo.hasAccess,
      accessInfo.userAccessLevel,
      accessInfo.requiredTier
    )

    res.json(safeResource)
  } catch (error) {
    console.error('Get resource error:', error)
    res.status(500).json({ message: 'Failed to get resource' })
  }
}

// Создать ресурс (admin/teacher только)
export const createResource = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const {
      title,
      description,
      type,
      category,
      fileUrl,
      externalUrl,
      thumbnail,
      fileSize,
      fileName,
      author,
      publishedYear,
      accessLevel,
      tags,
      isPublished,
      order,
    } = req.body

    if (!title || !title.ru || !title.ro) {
      return res.status(400).json({ message: 'Title in both languages is required' })
    }

    if (!description || !description.ru || !description.ro) {
      return res.status(400).json({ message: 'Description in both languages is required' })
    }

    if (!type || !category) {
      return res.status(400).json({ message: 'Type and category are required' })
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      category,
      fileUrl,
      externalUrl,
      thumbnail,
      fileSize,
      fileName,
      author,
      publishedYear,
      accessLevel: accessLevel || 'free',
      tags: tags || [],
      uploadedBy: userId,
      isPublished: isPublished !== false,
      order: order || 0,
    })

    // Audit log - resource created
    await createAuditLog({
      userId,
      action: 'create_resource',
      entityType: 'resource',
      entityId: resource._id.toString(),
      changes: { title, type, category },
      req,
      status: 'success',
    })

    res.status(201).json(resource)
  } catch (error) {
    console.error('Create resource error:', error)
    res.status(500).json({ message: 'Failed to create resource' })
  }
}

// Обновить ресурс (admin/teacher только)
export const updateResource = async (req: CustomRequest, res: Response) => {
  try {
    const { resourceId } = req.params
    const updates = req.body

    const resource = await Resource.findByIdAndUpdate(resourceId, updates, { new: true, runValidators: true })

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    // Audit log - resource updated
    await createAuditLog({
      userId: req.userId,
      action: 'update_resource',
      entityType: 'resource',
      entityId: resourceId,
      changes: updates,
      req,
      status: 'success',
    })

    res.json(resource)
  } catch (error) {
    console.error('Update resource error:', error)
    res.status(500).json({ message: 'Failed to update resource' })
  }
}

// Удалить ресурс (admin/teacher только)
export const deleteResource = async (req: CustomRequest, res: Response) => {
  try {
    const { resourceId } = req.params

    const resource = await Resource.findByIdAndDelete(resourceId)

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    // Audit log - resource deleted
    await createAuditLog({
      userId: req.userId,
      action: 'delete_resource',
      entityType: 'resource',
      entityId: resourceId,
      changes: { title: resource.title },
      req,
      status: 'success',
    })

    res.json({ message: 'Resource deleted successfully' })
  } catch (error) {
    console.error('Delete resource error:', error)
    res.status(500).json({ message: 'Failed to delete resource' })
  }
}

// Увеличить счетчик загрузок
export const incrementDownloads = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params

    const resource = await Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } }, { new: true })

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    res.json({ downloads: resource.downloads })
  } catch (error) {
    console.error('Increment downloads error:', error)
    res.status(500).json({ message: 'Failed to increment downloads' })
  }
}

// Получить категории ресурсов
export const getResourceCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Resource.distinct('category', { isPublished: true })
    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ message: 'Failed to get categories' })
  }
}

// Получить все теги
export const getResourceTags = async (req: Request, res: Response) => {
  try {
    const tags = await Resource.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
    ])

    res.json(tags)
  } catch (error) {
    console.error('Get tags error:', error)
    res.status(500).json({ message: 'Failed to get tags' })
  }
}
