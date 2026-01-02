import { Request, Response } from 'express'
import Resource from '../models/Resource'
import { createAuditLog } from '../services/auditLogService'

interface CustomRequest extends Request {
  userId?: string
  user?: any
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

    res.json(resources)
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

    res.json(resource)
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
