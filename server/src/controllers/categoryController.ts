import { Request, Response } from 'express'
import Category from '../models/Category'
import { createAuditLog } from '../services/auditLogService'

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).userRole

    // Filter categories based on user role
    // Teachers and admins see all categories, students only see non-restricted ones
    const query = (userRole === 'teacher' || userRole === 'admin')
      ? {} // Show all categories
      : { teacherOnly: { $ne: true } } // Show only non-teacher-only categories

    const categories = await Category.find(query).sort({ order: 1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch categories' } })
  }
}

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } })
    }
    res.json(category)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch category' } })
  }
}

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = new Category(req.body)
    await category.save()

    // Audit log - category created
    await createAuditLog({
      userId: (req as any).userId,
      action: 'create_category',
      entityType: 'category',
      entityId: category._id.toString(),
      changes: { name: category.name },
      req,
      status: 'success',
    })

    res.status(201).json(category)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to create category' } })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } })
    }

    // Audit log - category updated
    await createAuditLog({
      userId: (req as any).userId,
      action: 'update_category',
      entityType: 'category',
      entityId: req.params.id,
      changes: req.body,
      req,
      status: 'success',
    })

    res.json(category)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to update category' } })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } })
    }

    // Audit log - category deleted
    await createAuditLog({
      userId: (req as any).userId,
      action: 'delete_category',
      entityType: 'category',
      entityId: req.params.id,
      changes: { name: category.name },
      req,
      status: 'success',
    })

    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete category' } })
  }
}
