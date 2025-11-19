import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext' 
import { uploadMedia } from '@/services/api'
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'

// ВАЖНО: Предполагаем, что uploadMedia был добавлен в client/src/services/api.ts

interface UploadedFile {
  url: string
  filename: string
  mimetype: string
  size: number
}

const MediaManager = () => {
  const { token } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  // Используем mockFiles, так как реальный список файлов нужно запрашивать через новый API
  const [mockFiles, setMockFiles] = useState<UploadedFile[]>([]); 
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !token) return

    setIsUploading(true)
    try {
      // Использование API-сервиса для загрузки
      const result = await uploadMedia(file, token) 
      const newFile: UploadedFile = {
        url: result.url,
        filename: result.filename,
        mimetype: result.mimetype,
        size: result.size,
      }
      setMockFiles(prev => [newFile, ...prev]);
      showSnackbar(`Файл ${file.name} успешно загружен!`, 'success')
    } catch (error) {
      showSnackbar('Ошибка загрузки файла. Проверьте права и настройки сервера.', 'error')
    } finally {
      setIsUploading(false)
      // Сброс поля ввода файла
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteFile = (filename: string) => {
    // В Production здесь был бы API-вызов deleteMedia
    if (!confirm(`Вы уверены, что хотите удалить файл ${filename}?`)) return;

    setMockFiles(prev => prev.filter(f => f.filename !== filename));
    showSnackbar(`Файл ${filename} удален (локальный Mock).`, 'success');
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Управление медиафайлами
      </Typography>
      <Alert severity="warning" sx={{ mb: 3 }}>
        ВНИМАНИЕ: Загрузка файлов на бэкенде настроена на Mock-режим. Для Production необходимо интегрировать 
        облачное хранилище (AWS S3 / Cloudinary) в `server/src/controllers/mediaController.ts`.
      </Alert>

      <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          type="file"
          ref={fileInputRef}
          hidden
          onChange={handleFileChange}
          accept="image/*,.glb,.mp4"
        />
        <Button
          variant="contained"
          startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          size="large"
        >
          {isUploading ? 'Загрузка...' : 'Выбрать файл для загрузки'}
        </Button>
        <Typography variant="caption" sx={{ mt: 1 }}>
            Макс. 10MB. Поддерживаются изображения, видео (.mp4), 3D-модели (.glb)
        </Typography>
      </Paper>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Загруженные файлы (Mock List)
      </Typography>
      <Paper>
        <List>
          {mockFiles.length === 0 ? (
            <ListItem>
              <ListItemText secondary="Нет загруженных файлов." />
            </ListItem>
          ) : (
            mockFiles.map((file, index) => (
              <Box key={file.filename}>
                <ListItem>
                  <ListItemText
                    primary={file.filename}
                    secondary={`Тип: ${file.mimetype} | Размер: ${formatFileSize(file.size)} | URL: ${file.url}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file.filename)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < mockFiles.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MediaManager