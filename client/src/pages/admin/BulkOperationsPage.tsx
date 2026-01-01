import { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  Divider,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import api from '@/services/api'
import { useTranslation } from 'react-i18next'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function BulkOperationsPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Import state
  const [csvData, setCsvData] = useState('')

  // Export state
  const [exportRole, setExportRole] = useState('')

  // Bulk actions state
  const [selectedAction, setSelectedAction] = useState<'delete' | 'update-role' | ''>('')
  const [newRole, setNewRole] = useState('student')

  // Bulk grades state
  const [gradesCsvData, setGradesCsvData] = useState('')

  const handleExport = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const params = new URLSearchParams()
      if (exportRole) params.append('role', exportRole)

      const response = await api.get(`/bulk/users/export?${params.toString()}`, {
        responseType: 'blob',
      })

      // Download CSV
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users-export-${new Date().toISOString()}.csv`
      link.click()
      window.URL.revokeObjectURL(url)

      setMessage({
        type: 'success',
        text: lang === 'ru' ? 'Пользователи экспортированы' : 'Utilizatori exportați',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Export failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const response = await api.post('/bulk/users/import', { csvData })

      setMessage({
        type: 'success',
        text: `${lang === 'ru' ? 'Импорт завершён' : 'Import finalizat'}: ${response.data.created} ${
          lang === 'ru' ? 'создано' : 'create'
        }, ${response.data.skipped} ${lang === 'ru' ? 'пропущено' : 'omise'}`,
      })
      setCsvData('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Import failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const csvTemplate = `email,firstName,lastName,role,password
student1@example.com,John,Doe,student,password123
student2@example.com,Jane,Smith,student,password456`

  const gradesTemplate = `studentEmail,assignmentId,grade,feedback
student1@example.com,65abc123def,90,Great work!
student2@example.com,65abc123def,85,Good job`

  const handleGradesUpload = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const response = await api.post('/bulk/grades/upload', { csvData: gradesCsvData })

      setMessage({
        type: 'success',
        text: `${lang === 'ru' ? 'Оценки загружены' : 'Note încărcate'}: ${response.data.updated} ${
          lang === 'ru' ? 'обновлено' : 'actualizate'
        }, ${response.data.skipped} ${lang === 'ru' ? 'пропущено' : 'omise'}`,
      })
      setGradesCsvData('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Upload failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'users-import-template.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        {lang === 'ru' ? 'Массовые операции' : 'Operații în masă'}
      </Typography>

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label={lang === 'ru' ? 'Импорт пользователей' : 'Import utilizatori'} />
          <Tab label={lang === 'ru' ? 'Экспорт пользователей' : 'Export utilizatori'} />
          <Tab label={lang === 'ru' ? 'Загрузка оценок' : 'Încărcare note'} />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru' ? 'Импорт пользователей из CSV' : 'Import utilizatori din CSV'}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
            >
              {lang === 'ru' ? 'Скачать шаблон' : 'Descarcă șablon'}
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            {lang === 'ru'
              ? 'Формат CSV: email,firstName,lastName,role,password'
              : 'Format CSV: email,firstName,lastName,role,password'}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={10}
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder={csvTemplate}
            sx={{ my: 2 }}
          />

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <UploadFileIcon />}
            onClick={handleImport}
            disabled={loading || !csvData.trim()}
          >
            {loading
              ? lang === 'ru'
                ? 'Импортирование...'
                : 'Se importă...'
              : lang === 'ru'
              ? 'Импортировать'
              : 'Importă'}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Alert severity="info">
            <Typography variant="body2">
              {lang === 'ru'
                ? 'Примечания:'
                : 'Note:'}
            </Typography>
            <ul>
              <li>{lang === 'ru' ? 'Существующие пользователи будут пропущены' : 'Utilizatorii existenți vor fi omise'}</li>
              <li>{lang === 'ru' ? 'Роли: student, teacher, admin' : 'Roluri: student, teacher, admin'}</li>
              <li>{lang === 'ru' ? 'Пароли будут захешированы автоматически' : 'Parolele vor fi hashate automat'}</li>
            </ul>
          </Alert>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru' ? 'Экспорт пользователей в CSV' : 'Export utilizatori în CSV'}
          </Typography>

          <FormControl fullWidth sx={{ my: 2 }}>
            <InputLabel>{lang === 'ru' ? 'Роль (опционально)' : 'Rol (opțional)'}</InputLabel>
            <Select
              value={exportRole}
              label={lang === 'ru' ? 'Роль (опционально)' : 'Rol (opțional)'}
              onChange={(e) => setExportRole(e.target.value)}
            >
              <MenuItem value="">{lang === 'ru' ? 'Все пользователи' : 'Toți utilizatorii'}</MenuItem>
              <MenuItem value="student">{lang === 'ru' ? 'Студенты' : 'Studenți'}</MenuItem>
              <MenuItem value="teacher">{lang === 'ru' ? 'Преподаватели' : 'Profesori'}</MenuItem>
              <MenuItem value="admin">{lang === 'ru' ? 'Администраторы' : 'Administratori'}</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
          >
            {loading
              ? lang === 'ru'
                ? 'Экспортирование...'
                : 'Se exportă...'
              : lang === 'ru'
              ? 'Экспортировать'
              : 'Exportă'}
          </Button>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru' ? 'Массовая загрузка оценок из CSV' : 'Încărcare în masă a notelor din CSV'}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const blob = new Blob([gradesTemplate], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = 'grades-upload-template.csv'
                link.click()
                window.URL.revokeObjectURL(url)
              }}
            >
              {lang === 'ru' ? 'Скачать шаблон' : 'Descarcă șablon'}
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            {lang === 'ru'
              ? 'Формат CSV: studentEmail,assignmentId,grade,feedback'
              : 'Format CSV: studentEmail,assignmentId,grade,feedback'}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={10}
            value={gradesCsvData}
            onChange={(e) => setGradesCsvData(e.target.value)}
            placeholder={gradesTemplate}
            sx={{ my: 2 }}
          />

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <UploadFileIcon />}
            onClick={handleGradesUpload}
            disabled={loading || !gradesCsvData.trim()}
          >
            {loading
              ? lang === 'ru'
                ? 'Загрузка...'
                : 'Se încarcă...'
              : lang === 'ru'
              ? 'Загрузить оценки'
              : 'Încarcă notele'}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Alert severity="info">
            <Typography variant="body2">
              {lang === 'ru'
                ? 'Примечания:'
                : 'Note:'}
            </Typography>
            <ul>
              <li>{lang === 'ru' ? 'assignmentId можно найти в URL задания' : 'assignmentId poate fi găsit în URL-ul sarcinii'}</li>
              <li>{lang === 'ru' ? 'Если нет сдачи, она будет создана автоматически' : 'Dacă nu există predare, va fi creată automat'}</li>
              <li>{lang === 'ru' ? 'Отправляются push-уведомления студентам' : 'Se trimit notificări push studenților'}</li>
            </ul>
          </Alert>
        </TabPanel>
      </Paper>
    </Container>
  )
}
