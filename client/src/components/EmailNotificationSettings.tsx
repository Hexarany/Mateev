import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Switch,
  FormControlLabel,
  FormGroup,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import {
  getEmailNotificationSettings,
  updateEmailNotificationSettings,
  EmailNotificationSettings as EmailSettings,
} from '@/services/api'

const EmailNotificationSettings = () => {
  const { token } = useAuth()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'

  const [settings, setSettings] = useState<EmailSettings | null>(null)
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    if (!token) return

    try {
      setLoading(true)
      const data = await getEmailNotificationSettings(token)
      setSettings(data.emailNotifications)
      setEmail(data.email)
    } catch (error) {
      console.error('Error loading email notification settings:', error)
      showSnackbar(
        lang === 'ru' ? 'Ошибка загрузки настроек' : 'Eroare la încărcarea setărilor',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (key: keyof EmailSettings, value: boolean) => {
    if (!token || !settings) return

    const newSettings = { ...settings, [key]: value }

    try {
      setUpdating(true)
      await updateEmailNotificationSettings({ [key]: value }, token)
      setSettings(newSettings)
      showSnackbar(
        lang === 'ru' ? 'Настройки сохранены' : 'Setările au fost salvate',
        'success'
      )
    } catch (error) {
      console.error('Error updating email notification settings:', error)
      showSnackbar(
        lang === 'ru' ? 'Ошибка при сохранении' : 'Eroare la salvare',
        'error'
      )
    } finally {
      setUpdating(false)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!settings) {
    return null
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmailIcon sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, mr: 2 }} />
            <Typography variant="h5" fontWeight={600}>
              {lang === 'ru' ? 'Email уведомления' : 'Notificări email'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {lang === 'ru' ? 'Ваш email' : 'Email-ul tău'}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {email}
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            {lang === 'ru'
              ? 'Управляйте типами email уведомлений, которые вы хотите получать'
              : 'Gestionează tipurile de notificări email pe care dorești să le primești'}
          </Alert>

          <Typography variant="h6" gutterBottom fontWeight={600}>
            {lang === 'ru' ? 'Настройки уведомлений' : 'Setări notificări'}
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enabled}
                  onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  disabled={updating}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {lang === 'ru'
                      ? 'Включить email уведомления'
                      : 'Activează notificările email'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {lang === 'ru'
                      ? 'Главный переключатель для всех email уведомлений'
                      : 'Comutator principal pentru toate notificările email'}
                  </Typography>
                </Box>
              }
            />

            {settings.enabled && (
              <Box sx={{ ml: 4, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.homework}
                      onChange={(e) => handleSettingChange('homework', e.target.checked)}
                      disabled={updating}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {lang === 'ru' ? 'Домашние задания' : 'Teme pentru acasă'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {lang === 'ru'
                          ? 'Уведомления о новых заданиях и дедлайнах'
                          : 'Notificări despre teme noi și deadline-uri'}
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.grades}
                      onChange={(e) => handleSettingChange('grades', e.target.checked)}
                      disabled={updating}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {lang === 'ru' ? 'Оценки' : 'Note'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {lang === 'ru'
                          ? 'Уведомления о выставленных оценках'
                          : 'Notificări despre notele primite'}
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.schedule}
                      onChange={(e) => handleSettingChange('schedule', e.target.checked)}
                      disabled={updating}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {lang === 'ru' ? 'Расписание' : 'Program'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {lang === 'ru'
                          ? 'Уведомления об изменениях в расписании'
                          : 'Notificări despre modificări în program'}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            )}
          </FormGroup>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EmailNotificationSettings
