import { Request, Response } from 'express'
import Topic from '../models/Topic'
import mongoose from 'mongoose'

// Расширяем Request для доступа к данным пользователя после аутентификации
interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
  hasActiveSubscription?: boolean 
}

// Helper: Проверяет, авторизован ли пользователь для получения полного контента
const isAuthorizedForFullContent = (req: CustomRequest): boolean => {
  const userRole = req.userRole;
  const hasActiveSubscription = (req as any).hasActiveSubscription; 
  if (userRole === 'admin') return true;
  if (hasActiveSubscription) return true;
  return false;
};

// Helper: Применяет блокировку контента
const createSafeTopic = (topic: any, isAuthorized: boolean) => {
    // Получаем превью контента (первые 400 символов)
    const previewContentRu = topic.content.ru ? topic.content.ru.substring(0, 400) + '...' : '';
    const previewContentRo = topic.content.ro ? topic.content.ro.substring(0, 400) + '...' : '';

    return {
        ...topic.toObject(),
        categoryId: topic.categoryId, 
        
        content: isAuthorized 
          ? topic.content 
          : { ru: previewContentRu, ro: previewContentRo },
        hasFullContentAccess: isAuthorized,
    };
};


export const getAllTopics = async (req: Request, res: Response) => {
  try {
    // Оптимизация: populate только нужные поля
    const topics = await Topic.find().sort({ order: 1 }).populate('categoryId', 'name slug') 
    
    // В списке тем не блокируем контент, только в детальном просмотре
    res.json(topics)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch topics' } })
  }
}

// ОБНОВЛЕНО: Поддержка ID или SLUG + Content Lock
export const getTopicById = async (req: Request, res: Response) => {
  try {
    const slugOrId = req.params.id;

    // Определяем, ищем по ID или по Slug
    const query = mongoose.Types.ObjectId.isValid(slugOrId)
      ? { _id: slugOrId }
      : { slug: slugOrId };

    const topic = await Topic.findOne(query).populate('categoryId', 'name slug');
    
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }

    // Применяем логику Content Lock
    const isAuthorized = isAuthorizedForFullContent(req as CustomRequest);
    const safeTopic = createSafeTopic(topic, isAuthorized);

    res.json(safeTopic)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch topic' } })
  }
}

export const getTopicsByCategory = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({ categoryId: req.params.categoryId })
      .sort({ order: 1 })
      .populate('categoryId', 'name slug') 
    res.json(topics)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch topics' } })
  }
}

export const createTopic = async (req: Request, res: Response) => {
  try {
    const topic = new Topic(req.body)
    await topic.save()
    res.status(201).json(topic)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to create topic' } })
  }
}

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name slug'); // Populate для лучшего ответа
    
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }
    res.json(topic)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to update topic' } })
  }
}

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id)
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }
    res.json({ message: 'Topic deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete topic' } })
  }
}