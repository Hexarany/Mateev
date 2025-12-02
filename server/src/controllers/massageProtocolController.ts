import { Request, Response } from 'express'
import MassageProtocol from '../models/MassageProtocol'
import User from '../models/User'
import mongoose from 'mongoose'
import { BASIC_TIER_MASSAGE_PROTOCOLS } from '../config/tier-plans'

interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
  hasActiveSubscription?: boolean
}

// Helper: Check if user has access to specific protocol based on tier
const hasAccessToProtocol = async (
  protocol: any,
  userId: string | undefined,
  userRole: string | undefined
): Promise<{ hasAccess: boolean; userAccessLevel: string; requiredTier: string }> => {
  // Admins and teachers have full access
  if (userRole === 'admin' || userRole === 'teacher') {
    return { hasAccess: true, userAccessLevel: 'premium', requiredTier: 'free' }
  }

  // Get user access level
  let userAccessLevel: 'free' | 'basic' | 'premium' = 'free'
  if (userId) {
    const user = await User.findById(userId)
    userAccessLevel = user?.accessLevel || 'free'
  }

  // Check if protocol is in basic tier
  const isBasicTierProtocol = BASIC_TIER_MASSAGE_PROTOCOLS.includes(protocol.slug)
  const requiredTier = isBasicTierProtocol ? 'basic' : 'premium'

  // Premium users have access to everything
  if (userAccessLevel === 'premium') {
    return { hasAccess: true, userAccessLevel, requiredTier }
  }

  // Basic users have access to basic tier protocols only
  if (userAccessLevel === 'basic' && isBasicTierProtocol) {
    return { hasAccess: true, userAccessLevel, requiredTier }
  }

  // Free users only get preview
  return { hasAccess: false, userAccessLevel, requiredTier }
}

// Helper: Применяет блокировку контента
const createSafeProtocol = (
  protocol: any,
  hasAccess: boolean,
  userAccessLevel: string,
  requiredTier: string
) => {
  const previewContentRu = protocol.content.ru ? protocol.content.ru.substring(0, 400) + '...' : ''
  const previewContentRo = protocol.content.ro ? protocol.content.ro.substring(0, 400) + '...' : ''

  return {
    ...protocol.toObject(),
    content: hasAccess ? protocol.content : { ru: previewContentRu, ro: previewContentRo },
    hasFullContentAccess: hasAccess,
    accessInfo: {
      hasFullAccess: hasAccess,
      userAccessLevel,
      requiredTier,
      isBasicTier: BASIC_TIER_MASSAGE_PROTOCOLS.includes(protocol.slug),
    },
  }
}

// Получить все протоколы массажа
export const getAllMassageProtocols = async (req: Request, res: Response) => {
  try {
    const protocols = await MassageProtocol.find().sort({ order: 1 })
    res.json(protocols)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch massage protocols' } })
  }
}

// Получить протокол по ID или slug
export const getMassageProtocolById = async (req: Request, res: Response) => {
  try {
    const slugOrId = req.params.id

    const query = mongoose.Types.ObjectId.isValid(slugOrId) ? { _id: slugOrId } : { slug: slugOrId }

    const protocol = await MassageProtocol.findOne(query)

    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    const customReq = req as CustomRequest
    const accessInfo = await hasAccessToProtocol(protocol, customReq.userId, customReq.userRole)

    const safeProtocol = createSafeProtocol(
      protocol,
      accessInfo.hasAccess,
      accessInfo.userAccessLevel,
      accessInfo.requiredTier
    )

    res.json(safeProtocol)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch massage protocol' } })
  }
}

// Создать протокол массажа (ADMIN)
export const createMassageProtocol = async (req: Request, res: Response) => {
  try {
    const protocol = new MassageProtocol(req.body)
    await protocol.save()
    res.status(201).json(protocol)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to create massage protocol' } })
  }
}

// Обновить протокол массажа (ADMIN)
export const updateMassageProtocol = async (req: Request, res: Response) => {
  try {
    const protocol = await MassageProtocol.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }
    res.json(protocol)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to update massage protocol' } })
  }
}

// Удалить протокол массажа (ADMIN)
export const deleteMassageProtocol = async (req: Request, res: Response) => {
  try {
    const protocol = await MassageProtocol.findByIdAndDelete(req.params.id)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }
    res.json({ message: 'Massage protocol deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete massage protocol' } })
  }
}

// Управление изображениями
export const addImageToProtocol = async (req: Request, res: Response) => {
  try {
    const { protocolId } = req.params
    const { url, filename, caption } = req.body

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    protocol.images.push({
      url,
      filename,
      caption: caption || { ru: '', ro: '' },
      type: 'image'
    } as any)

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error adding image to protocol:', error)
    res.status(500).json({ error: { message: 'Failed to add image to protocol' } })
  }
}

export const removeImageFromProtocol = async (req: Request, res: Response) => {
  try {
    const { protocolId, imageId } = req.params

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    protocol.images = protocol.images.filter((img: any) => img._id.toString() !== imageId)

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error removing image from protocol:', error)
    res.status(500).json({ error: { message: 'Failed to remove image from protocol' } })
  }
}

export const updateImageCaption = async (req: Request, res: Response) => {
  try {
    const { protocolId, imageId } = req.params
    const { caption } = req.body

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    const image = protocol.images.find((img: any) => img._id.toString() === imageId)
    if (!image) {
      return res.status(404).json({ error: { message: 'Image not found' } })
    }

    image.caption = caption

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error updating image caption:', error)
    res.status(500).json({ error: { message: 'Failed to update image caption' } })
  }
}

// Управление видео
export const addVideoToProtocol = async (req: Request, res: Response) => {
  try {
    const { protocolId } = req.params
    const { url, filename, caption } = req.body

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    protocol.videos.push({
      url,
      filename,
      caption: caption || { ru: '', ro: '' },
      type: 'video'
    } as any)

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error adding video to protocol:', error)
    res.status(500).json({ error: { message: 'Failed to add video to protocol' } })
  }
}

export const removeVideoFromProtocol = async (req: Request, res: Response) => {
  try {
    const { protocolId, videoId } = req.params

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    protocol.videos = protocol.videos.filter((vid: any) => vid._id.toString() !== videoId)

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error removing video from protocol:', error)
    res.status(500).json({ error: { message: 'Failed to remove video from protocol' } })
  }
}

export const updateVideoCaption = async (req: Request, res: Response) => {
  try {
    const { protocolId, videoId } = req.params
    const { caption } = req.body

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    const video = protocol.videos.find((vid: any) => vid._id.toString() === videoId)
    if (!video) {
      return res.status(404).json({ error: { message: 'Video not found' } })
    }

    video.caption = caption

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error updating video caption:', error)
    res.status(500).json({ error: { message: 'Failed to update video caption' } })
  }
}
