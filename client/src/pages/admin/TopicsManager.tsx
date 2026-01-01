import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Typography,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { Topic, Category } from '@/types'
import TopicImagesManager from '@/components/TopicImagesManager'
import { createTopic, updateTopic, deleteTopic } from '@/services/api' // <-- ИМПОРТ НОВЫХ ФУНКЦИЙ

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

const TopicsManager = () => {
  const { token } = useAuth()
  const [topics, setTopics] = useState<Topic[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    name: { ru: '', ro: '' },
    description: { ru: '', ro: '' },
    content: { ru: '', ro: '' },
    categoryId: '',
    imageUrl: '',
    modelUrl: '',
    order: 0,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimatedTime: 10,
    youtubeVideos: [] as Array<{
      url: string
      title: { ru: string; ro: string }
      description?: { ru: string; ro: string }
      author?: string
      duration?: number
    }>,
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  useEffect(() => {
    loadTopics()
    loadCategories()
  }, [])

  const loadTopics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/topics`)
      setTopics(response.data)
    } catch (error) {
      showSnackbar('Ошибка загрузки тем', 'error')
    }
  }

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`)
      setCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleOpenDialog = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic)
      setFormData({
        name: topic.name,
        description: topic.description,
        content: topic.content,
        // Проверка: topic.categoryId может быть ObjectId (string) или populated object (Category)
        categoryId: typeof topic.categoryId === 'string' ? topic.categoryId : topic.categoryId._id,
        imageUrl: topic.imageUrl || '',
        modelUrl: topic.modelUrl || '',
        order: topic.order,
        difficulty: topic.difficulty,
        estimatedTime: topic.estimatedTime,
        youtubeVideos: (topic as any).youtubeVideos || [],
      })
    } else {
      setEditingTopic(null)
      setFormData({
        name: { ru: '', ro: '' },
        description: { ru: '', ro: '' },
        content: { ru: '', ro: '' },
        categoryId: categories[0]?._id || '',
        imageUrl: '',
        modelUrl: '',
        order: topics.length,
        difficulty: 'beginner',
        estimatedTime: 10,
        youtubeVideos: [],
      })
    }
    setOpenDialog(true)
    setActiveTab(0)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingTopic(null)
  }

  const handleSave = async () => {
    if (!token) return

    try {
      // Подготовка данных, включая slug (будет создан на сервере, но устанавливаем order)
      const dataToSend = { 
          ...formData, 
          // Устанавливаем order, если это новая тема и order не задан
          order: formData.order === 0 && !editingTopic ? topics.length + 1 : formData.order 
      };

      if (editingTopic) {
        // Использование стандартизированной функции API: PUT
        await updateTopic(editingTopic._id, dataToSend, token)
        showSnackbar('Тема обновлена', 'success')
      } else {
        // Использование стандартизированной функции API: POST
        await createTopic(dataToSend, token)
        showSnackbar('Тема создана', 'success')
      }
      loadTopics()
      handleCloseDialog()
    } catch (error) {
      // TODO: Отображение более детальной ошибки с сервера
      showSnackbar('Ошибка сохранения', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Вы уверены? / Sunteți sigur?')) return

    try {
      // Использование стандартизированной функции API: DELETE
      await deleteTopic(id, token)
      showSnackbar('Тема удалена', 'success')
      loadTopics()
    } catch (error) {
      showSnackbar('Ошибка удаления', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const getCategoryName = (categoryId: string | Category) => {
    if (typeof categoryId === 'string') {
      const cat = categories.find(c => c._id === categoryId)
      return cat?.name.ru || categoryId
    }
    return categoryId.name.ru
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Управление темами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить тему
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          maxWidth: '100%',
          '& .MuiTable-root': {
            minWidth: { xs: 500, sm: 600, md: 'auto' },
          },
          '& .MuiTableCell-root': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 8px', sm: '12px 16px' },
          },
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: (theme) => theme.palette.action.hover,
          }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Порядок</TableCell>
              <TableCell>Название (RU)</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Категория</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Сложность</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Время (мин)</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{topic.order}</TableCell>
                <TableCell>{topic.name.ru}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{getCategoryName(topic.categoryId)}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{topic.difficulty}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{topic.estimatedTime}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenDialog(topic)}
                    color="primary"
                    size="small"
                    sx={{ p: { xs: 0.5, sm: 1 } }}
                  >
                    <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(topic._id)}
                    color="error"
                    size="small"
                    sx={{ p: { xs: 0.5, sm: 1 } }}
                  >
                    <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: { xs: '100vh', sm: 'calc(100vh - 64px)' },
            m: { xs: 0, sm: 2 },
          }
        }}
      >
        <DialogTitle sx={{ pb: { xs: 1, sm: 2 } }}>
          {editingTopic ? 'Редактировать тему' : 'Новая тема'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 1, sm: 2 } }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: 60, sm: 90 },
                  px: { xs: 1, sm: 2 },
                }
              }}
            >
              <Tab label="Основное" />
              <Tab label="Контент RU" />
              <Tab label="Контент RO" />
              <Tab label="Медиа" />
              <Tab label="YouTube видео" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
              <TextField
                label="Название (RU)"
                value={formData.name.ru}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...formData.name, ru: e.target.value } })
                }
                fullWidth
                size="small"
              />
              <TextField
                label="Название (RO)"
                value={formData.name.ro}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...formData.name, ro: e.target.value } })
                }
                fullWidth
                size="small"
              />
              <TextField
                select
                label="Категория"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                fullWidth
                size="small"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name.ru}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Сложность"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value as any })
                }
                fullWidth
                size="small"
              >
                <MenuItem value="beginner">Начальный</MenuItem>
                <MenuItem value="intermediate">Средний</MenuItem>
                <MenuItem value="advanced">Продвинутый</MenuItem>
              </TextField>
              <TextField
                label="Время изучения (минут)"
                type="number"
                value={formData.estimatedTime}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })
                }
                fullWidth
                size="small"
              />
              <TextField
                label="Порядок"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
                fullWidth
                size="small"
              />
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
              <TextField
                label="Описание (RU)"
                value={formData.description.ru}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: { ...formData.description, ru: e.target.value },
                  })
                }
                multiline
                rows={3}
                fullWidth
                size="small"
              />
              <TextField
                label="Контент (RU) - Markdown"
                value={formData.content.ru}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, ru: e.target.value },
                  })
                }
                multiline
                rows={15}
                fullWidth
                size="small"
                helperText="Используйте Markdown для форматирования. Поддерживаются заголовки, списки, жирный текст и т.д."
              />
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
              <TextField
                label="Описание (RO)"
                value={formData.description.ro}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: { ...formData.description, ro: e.target.value },
                  })
                }
                multiline
                rows={3}
                fullWidth
                size="small"
              />
              <TextField
                label="Контент (RO) - Markdown"
                value={formData.content.ro}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, ro: e.target.value },
                  })
                }
                multiline
                rows={15}
                fullWidth
                size="small"
                helperText="Folosiți Markdown pentru formatare"
              />
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
              <TextField
                label="URL изображения"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                fullWidth
                size="small"
                helperText="URL картинки для превью темы"
              />
              <TextField
                label="URL 3D модели"
                value={formData.modelUrl}
                onChange={(e) => setFormData({ ...formData, modelUrl: e.target.value })}
                fullWidth
                size="small"
                helperText="URL файла .glb для 3D визуализации"
              />

              {editingTopic && editingTopic._id && (
                <>
                  <Box sx={{ borderTop: 2, borderColor: 'divider', pt: { xs: 2, sm: 3 }, mt: { xs: 1, sm: 2 } }} />
                  <TopicImagesManager
                    topicId={editingTopic._id}
                    images={editingTopic.images || []}
                    onUpdate={loadTopics}
                  />
                </>
              )}

              {!editingTopic && (
                <Alert severity="info" sx={{ mt: { xs: 1, sm: 2 } }}>
                  Иллюстрации можно добавить после создания топика
                </Alert>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                YouTube видео для темы
              </Typography>

              {formData.youtubeVideos.map((video, index) => (
                <Paper key={index} sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 1, sm: 2 } }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Видео #{index + 1}
                    </Typography>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        const newVideos = formData.youtubeVideos.filter((_, i) => i !== index)
                        setFormData({ ...formData, youtubeVideos: newVideos })
                      }}
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                    <TextField
                      label="URL видео YouTube"
                      value={video.url}
                      onChange={(e) => {
                        const newVideos = [...formData.youtubeVideos]
                        newVideos[index].url = e.target.value
                        setFormData({ ...formData, youtubeVideos: newVideos })
                      }}
                      fullWidth
                      required
                      size="small"
                      placeholder="https://www.youtube.com/watch?v=..."
                      helperText="Вставьте полную ссылку на YouTube видео"
                    />

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                      <TextField
                        label="Название (RU)"
                        value={video.title.ru}
                        onChange={(e) => {
                          const newVideos = [...formData.youtubeVideos]
                          newVideos[index].title.ru = e.target.value
                          setFormData({ ...formData, youtubeVideos: newVideos })
                        }}
                        fullWidth
                        required
                        size="small"
                      />
                      <TextField
                        label="Название (RO)"
                        value={video.title.ro}
                        onChange={(e) => {
                          const newVideos = [...formData.youtubeVideos]
                          newVideos[index].title.ro = e.target.value
                          setFormData({ ...formData, youtubeVideos: newVideos })
                        }}
                        fullWidth
                        required
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                      <TextField
                        label="Описание (RU)"
                        value={video.description?.ru || ''}
                        onChange={(e) => {
                          const newVideos = [...formData.youtubeVideos]
                          if (!newVideos[index].description) {
                            newVideos[index].description = { ru: '', ro: '' }
                          }
                          newVideos[index].description!.ru = e.target.value
                          setFormData({ ...formData, youtubeVideos: newVideos })
                        }}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                      />
                      <TextField
                        label="Описание (RO)"
                        value={video.description?.ro || ''}
                        onChange={(e) => {
                          const newVideos = [...formData.youtubeVideos]
                          if (!newVideos[index].description) {
                            newVideos[index].description = { ru: '', ro: '' }
                          }
                          newVideos[index].description!.ro = e.target.value
                          setFormData({ ...formData, youtubeVideos: newVideos })
                        }}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                      <TextField
                        label="Автор видео"
                        value={video.author || ''}
                        onChange={(e) => {
                          const newVideos = [...formData.youtubeVideos]
                          newVideos[index].author = e.target.value
                          setFormData({ ...formData, youtubeVideos: newVideos })
                        }}
                        fullWidth
                        size="small"
                        placeholder="Имя автора или канала"
                      />
                      <TextField
                        label="Длительность (минуты)"
                        type="number"
                        value={video.duration || ''}
                        onChange={(e) => {
                          const newVideos = [...formData.youtubeVideos]
                          newVideos[index].duration = parseInt(e.target.value) || undefined
                          setFormData({ ...formData, youtubeVideos: newVideos })
                        }}
                        fullWidth
                        size="small"
                        placeholder="Например: 15"
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData({
                    ...formData,
                    youtubeVideos: [
                      ...formData.youtubeVideos,
                      {
                        url: '',
                        title: { ru: '', ro: '' },
                        description: { ru: '', ro: '' },
                        author: '',
                        duration: undefined,
                      },
                    ],
                  })
                }}
                sx={{ mt: { xs: 0.5, sm: 1 }, minHeight: 40 }}
              >
                Добавить YouTube видео
              </Button>

              {formData.youtubeVideos.length === 0 && (
                <Alert severity="info">
                  Нет добавленных видео. Нажмите кнопку выше, чтобы добавить образовательное видео к теме.
                </Alert>
              )}
            </Box>
          </TabPanel>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, gap: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ minHeight: 40 }}>Отмена</Button>
          <Button onClick={handleSave} variant="contained" sx={{ minHeight: 40 }}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

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

export default TopicsManager