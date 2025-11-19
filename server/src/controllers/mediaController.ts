// server/src/controllers/mediaController.ts
import { Request, Response } from 'express'
import multer from 'multer'
// Удаляем импорт 'fs' и 'path'

// Конфигурация Multer без указания дискового хранилища
// ВНИМАНИЕ: Здесь должна быть интегрирована библиотека для облачного хранилища (например, multer-s3 или multer-cloudinary)
export const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB лимит
  // storage: new YourCloudStorageEngine(...)
})

// Контроллер загрузки
export const uploadMedia = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: { message: 'Файл не был предоставлен или превышен лимит размера.' } })
  }

  // В PRODUCTION-среде здесь должна быть логика, которая получает URL и filename от облачного сервиса.
  
  const fileInfo = {
    url: `https://your.cloud-storage.com/${req.file.filename}`, // Mock URL
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    message: 'Файл успешно загружен. В Production используйте облачный адаптер (S3/Cloudinary).',
  }

  res.status(200).json(fileInfo)
}

// Контроллер для удаления
export const deleteMedia = async (req: Request, res: Response) => {
  // В PRODUCTION: Здесь должна быть логика для удаления файла из облачного хранилища по URL/filename
  res.json({ message: 'Медиафайл удален из облака (stub).' })
}