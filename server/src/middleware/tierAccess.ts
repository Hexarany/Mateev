import { Request, Response, NextFunction } from 'express'
import User from '../models/User'

export interface TierRequest extends Request {
  userId?: string
  userRole?: string
  userAccessLevel?: 'free' | 'basic' | 'premium'
}

// Middleware to check tier access (doesn't block, just adds info to request)
export const checkTierAccess = async (req: TierRequest, res: Response, next: NextFunction) => {
  try {
    if (req.userId) {
      const user = await User.findById(req.userId)
      if (user) {
        req.userAccessLevel = user.accessLevel || 'free'
      }
    }
    next()
  } catch (error) {
    console.error('Tier access check error:', error)
    // Don't block the request, just continue
    next()
  }
}

// Middleware to require specific tier (blocks if insufficient)
export const requireTier = (minTier: 'free' | 'basic' | 'premium') => {
  return async (req: TierRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Необходима авторизация' })
      }

      const user = await User.findById(req.userId)
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' })
      }

      // Check if user has required tier
      const tierHierarchy = { free: 0, basic: 1, premium: 2 }
      const userTierLevel = tierHierarchy[user.accessLevel || 'free']
      const requiredTierLevel = tierHierarchy[minTier]

      // Admins and teachers bypass tier requirements
      if (user.role === 'admin' || user.role === 'teacher') {
        req.userAccessLevel = 'premium' // Grant full access
        return next()
      }

      if (userTierLevel < requiredTierLevel) {
        return res.status(403).json({
          message: 'Недостаточный уровень доступа',
          requiredTier: minTier,
          currentTier: user.accessLevel,
        })
      }

      req.userAccessLevel = user.accessLevel
      next()
    } catch (error) {
      console.error('Tier requirement check error:', error)
      res.status(500).json({ message: 'Ошибка проверки уровня доступа' })
    }
  }
}

// Helper function to check if user has access to specific tier
export const hasAccessToTier = (
  userAccessLevel: 'free' | 'basic' | 'premium' | undefined,
  requiredTier: 'free' | 'basic' | 'premium',
  userRole?: string
): boolean => {
  // Admins and teachers always have access
  if (userRole === 'admin' || userRole === 'teacher') {
    return true
  }

  const tierHierarchy = { free: 0, basic: 1, premium: 2 }
  const userLevel = tierHierarchy[userAccessLevel || 'free']
  const requiredLevel = tierHierarchy[requiredTier]

  return userLevel >= requiredLevel
}
