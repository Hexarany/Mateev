import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Chip,
  Typography,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import { sendEmailToUser, sendBulkEmail } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface SendEmailDialogProps {
  open: boolean
  onClose: () => void
  users: Array<{ _id: string; firstName: string; lastName: string; email: string }>
  onSuccess?: () => void
}

const SendEmailDialog = ({ open, onClose, users, onSuccess }: SendEmailDialogProps) => {
  const { token } = useAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [language, setLanguage] = useState<'ru' | 'ro'>('ru')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isBulk = users.length > 1

  const handleSend = async () => {
    if (!token) return

    // Validation
    if (!subject.trim()) {
      setError('Тема письма обязательна')
      return
    }

    if (!message.trim()) {
      setError('Сообщение обязательно')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isBulk) {
        // Send to multiple users
        const userIds = users.map(u => u._id)
        await sendBulkEmail({ userIds, subject, message, language }, token)
        setSuccess(`Email успешно отправлен ${users.length} пользователям!`)
      } else {
        // Send to single user
        await sendEmailToUser({ userId: users[0]._id, subject, message, language }, token)
        setSuccess(`Email успешно отправлен пользователю ${users[0].firstName} ${users[0].lastName}`)
      }

      // Reset form
      setTimeout(() => {
        setSubject('')
        setMessage('')
        setLanguage('ru')
        setSuccess('')
        onSuccess?.()
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error('Error sending email:', err)
      setError(err.response?.data?.error?.message || 'Ошибка при отправке email')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSubject('')
      setMessage('')
      setLanguage('ru')
      setError('')
      setSuccess('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="primary" />
          <Typography variant="h6">
            {isBulk ? `Отправить Email (${users.length} получателей)` : 'Отправить Email'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Recipients */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Получатели:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {users.map(user => (
              <Chip
                key={user._id}
                label={`${user.firstName} ${user.lastName} (${user.email})`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        {/* Language Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Язык письма</InputLabel>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'ru' | 'ro')}
            label="Язык письма"
            disabled={loading}
          >
            <MenuItem value="ru">Русский</MenuItem>
            <MenuItem value="ro">Румынский</MenuItem>
          </Select>
        </FormControl>

        {/* Subject */}
        <TextField
          label="Тема письма"
          fullWidth
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
          required
        />

        {/* Message */}
        <TextField
          label="Сообщение"
          fullWidth
          multiline
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          required
          placeholder="Введите текст сообщения..."
          helperText="Поддерживаются переносы строк"
        />

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={loading || !subject.trim() || !message.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
        >
          {loading ? 'Отправка...' : 'Отправить Email'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SendEmailDialog
