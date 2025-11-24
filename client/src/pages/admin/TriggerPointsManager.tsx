import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { TriggerPoint } from '@/types'
import { getTriggerPoints, deleteTriggerPoint } from '@/services/api'

const categories = [
  { value: 'head_neck', label: 'Голова/Шея / Cap/Gât' },
  { value: 'shoulder_arm', label: 'Плечо/Рука / Umăr/Braț' },
  { value: 'back', label: 'Спина / Spate' },
  { value: 'chest', label: 'Грудь / Piept' },
  { value: 'hip_leg', label: 'Бедро/Нога / Șold/Picior' },
  { value: 'other', label: 'Другое / Altele' },
]

const TriggerPointsManager = () => {
  const { token } = useAuth()
  const [points, setPoints] = useState<TriggerPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  useEffect(() => { loadPoints() }, [])

  const loadPoints = async () => {
    try {
      setLoading(true)
      const data = await getTriggerPoints()
      setPoints(data)
    } catch (error) {
      showSnackbar('Ошибка загрузки', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить триггерную точку?') || !token) return

    try {
      await deleteTriggerPoint(id, token)
      setPoints(prev => prev.filter(p => p._id !== id))
      showSnackbar('Точка удалена', 'success')
    } catch (error) {
      showSnackbar('Ошибка удаления', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Управление триггерными точками</Typography>
        <Button variant="contained" startIcon={<AddIcon />} disabled>
          Добавить точку (в разработке)
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Полная форма создания/редактирования в разработке. Пока доступен только список и удаление.
        Для добавления триггерных точек используйте MongoDB напрямую или API.
      </Alert>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название (RU)</TableCell>
                <TableCell>Мышца</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {points.map((point) => (
                <TableRow key={point._id}>
                  <TableCell>{point.name.ru}</TableCell>
                  <TableCell>{point.muscle}</TableCell>
                  <TableCell>{categories.find(c => c.value === point.category)?.label}</TableCell>
                  <TableCell>
                    <IconButton disabled color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(point._id)} color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {points.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Нет триггерных точек. Добавьте первую точку через API или MongoDB.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TriggerPointsManager
