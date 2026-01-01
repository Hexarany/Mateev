import { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff'
import AssignmentIcon from '@mui/icons-material/Assignment'
import GradeIcon from '@mui/icons-material/Grade'
import EventIcon from '@mui/icons-material/Event'
import AnnouncementIcon from '@mui/icons-material/Announcement'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useTranslation } from 'react-i18next'

export default function NotificationSettingsPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const {
    isSupported,
    isSubscribed,
    permission,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  // Notification preferences (would be stored in backend in production)
  const [preferences, setPreferences] = useState({
    newAssignment: true,
    gradePosted: true,
    scheduleChange: true,
    announcements: true,
  })

  const handleToggleSubscription = async () => {
    setLoading(true)
    setSuccess(null)

    try {
      if (isSubscribed) {
        const result = await unsubscribe()
        if (result) {
          setSuccess(
            lang === 'ru'
              ? 'Вы отписались от уведомлений'
              : 'Ați fost dezabonat de la notificări'
          )
        }
      } else {
        const result = await subscribe()
        if (result) {
          setSuccess(
            lang === 'ru'
              ? 'Вы подписались на уведомления!'
              : 'V-ați abonat la notificări!'
          )
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const notificationTypes = [
    {
      key: 'newAssignment' as const,
      icon: <AssignmentIcon />,
      title: lang === 'ru' ? 'Новые задания' : 'Sarcini noi',
      description:
        lang === 'ru'
          ? 'Уведомления о новых заданиях от преподавателя'
          : 'Notificări despre sarcini noi de la profesor',
    },
    {
      key: 'gradePosted' as const,
      icon: <GradeIcon />,
      title: lang === 'ru' ? 'Оценки' : 'Note',
      description:
        lang === 'ru'
          ? 'Уведомления о выставленных оценках'
          : 'Notificări despre notele postate',
    },
    {
      key: 'scheduleChange' as const,
      icon: <EventIcon />,
      title: lang === 'ru' ? 'Изменения расписания' : 'Modificări în orar',
      description:
        lang === 'ru'
          ? 'Уведомления об изменениях в расписании'
          : 'Notificări despre modificări în orar',
    },
    {
      key: 'announcements' as const,
      icon: <AnnouncementIcon />,
      title: lang === 'ru' ? 'Объявления' : 'Anunțuri',
      description:
        lang === 'ru'
          ? 'Важные объявления от администрации'
          : 'Anunțuri importante de la administrație',
    },
  ]

  if (!isSupported) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          {lang === 'ru'
            ? 'Ваш браузер не поддерживает push-уведомления. Попробуйте использовать Chrome, Firefox или Edge.'
            : 'Browserul dvs. nu acceptă notificări push. Încercați să utilizați Chrome, Firefox sau Edge.'}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        {lang === 'ru' ? 'Настройки уведомлений' : 'Setări notificări'}
      </Typography>

      {/* Main Subscription Toggle */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isSubscribed ? (
            <NotificationsActiveIcon color="primary" sx={{ fontSize: 40 }} />
          ) : (
            <NotificationsOffIcon color="disabled" sx={{ fontSize: 40 }} />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {lang === 'ru'
                ? 'Push-уведомления'
                : 'Notificări push'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {permission === 'granted'
                ? isSubscribed
                  ? lang === 'ru'
                    ? 'Вы подписаны на уведомления'
                    : 'Sunteți abonat la notificări'
                  : lang === 'ru'
                  ? 'Нажмите для подписки'
                  : 'Apăsați pentru a vă abona'
                : lang === 'ru'
                ? 'Разрешите уведомления для подписки'
                : 'Permiteți notificări pentru a vă abona'}
            </Typography>
          </Box>
          <Button
            variant={isSubscribed ? 'outlined' : 'contained'}
            onClick={handleToggleSubscription}
            disabled={loading || permission === 'denied'}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading
              ? lang === 'ru'
                ? 'Загрузка...'
                : 'Se încarcă...'
              : isSubscribed
              ? lang === 'ru'
                ? 'Отписаться'
                : 'Dezabonare'
              : lang === 'ru'
              ? 'Подписаться'
              : 'Abonare'}
          </Button>
        </Box>

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

        {permission === 'denied' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {lang === 'ru'
              ? 'Вы заблокировали уведомления. Разрешите их в настройках браузера.'
              : 'Ați blocat notificările. Permiteți-le în setările browserului.'}
          </Alert>
        )}
      </Paper>

      {/* Notification Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru'
              ? 'Типы уведомлений'
              : 'Tipuri de notificări'}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {lang === 'ru'
              ? 'Выберите, какие уведомления вы хотите получать'
              : 'Alegeți ce notificări doriți să primiți'}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <List>
            {notificationTypes.map((type, index) => (
              <ListItem
                key={type.key}
                sx={{
                  borderBottom:
                    index < notificationTypes.length - 1
                      ? '1px solid'
                      : 'none',
                  borderColor: 'divider',
                  py: 2,
                }}
              >
                <ListItemIcon>{type.icon}</ListItemIcon>
                <ListItemText
                  primary={type.title}
                  secondary={type.description}
                />
                <Switch
                  checked={preferences[type.key]}
                  onChange={() => handlePreferenceChange(type.key)}
                  disabled={!isSubscribed}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Test Notification */}
      {isSubscribed && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru'
              ? 'Тестовое уведомление'
              : 'Notificare de test'}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {lang === 'ru'
              ? 'Проверьте работу уведомлений'
              : 'Verificați funcționarea notificărilor'}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              new Notification('Anatomia', {
                body:
                  lang === 'ru'
                    ? 'Это тестовое уведомление'
                    : 'Aceasta este o notificare de test',
                icon: '/pwa-192x192.png',
              })
            }}
          >
            {lang === 'ru'
              ? 'Отправить тестовое уведомление'
              : 'Trimiteți notificare de test'}
          </Button>
        </Paper>
      )}
    </Container>
  )
}
