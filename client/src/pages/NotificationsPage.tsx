import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Pagination,
  Alert,
  Chip,
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import DeleteIcon from '@mui/icons-material/Delete'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import SchoolIcon from '@mui/icons-material/School'
import AnnouncementIcon from '@mui/icons-material/Announcement'
import QuizIcon from '@mui/icons-material/Quiz'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  type Notification,
} from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

const NotificationsPage = () => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const lang = i18n.language as 'ru' | 'ro'

  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadNotifications()
  }, [isAuthenticated, navigate, tab, page])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const unreadOnly = tab === 1
      const { notifications: notifs, pagination, unreadCount: count } = await getNotifications(
        page,
        10,
        unreadOnly
      )
      setNotifications(notifs)
      setTotalPages(pagination.pages)
      setUnreadCount(count)
    } catch (err: any) {
      console.error('Error loading notifications:', err)
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
    setPage(1)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(prev =>
          prev.map(n => (n._id === notification._id ? { ...n, isRead: true } : n))
        )
      }
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error: any) {
      console.error('Error marking all as read:', error)
      setError(error.response?.data?.message || 'Failed to mark all as read')
    }
  }

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      setError(error.response?.data?.message || 'Failed to delete notification')
    }
  }

  const handleDeleteAllRead = async () => {
    try {
      await deleteAllReadNotifications()
      setNotifications(prev => prev.filter(n => !n.isRead))
    } catch (error: any) {
      console.error('Error deleting read notifications:', error)
      setError(error.response?.data?.message || 'Failed to delete read notifications')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement_unlocked':
        return <CheckCircleIcon sx={{ fontSize: 40, color: (theme) => theme.palette.success.main }} />
      case 'certificate_ready':
        return <WorkspacePremiumIcon sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main }} />
      case 'new_content':
        return <SchoolIcon sx={{ fontSize: 40, color: (theme) => theme.palette.info.main }} />
      case 'quiz_reminder':
        return <QuizIcon sx={{ fontSize: 40, color: (theme) => theme.palette.warning.main }} />
      case 'system_announcement':
        return <AnnouncementIcon sx={{ fontSize: 40, color: (theme) => theme.palette.error.main }} />
      default:
        return <NotificationsIcon sx={{ fontSize: 40 }} />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(lang === 'ru' ? 'ru-RU' : 'ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          <NotificationsIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
          {lang === 'ru' ? 'Уведомления' : 'Notificări'}
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              size="small"
              color="error"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {lang === 'ru'
            ? 'Все ваши уведомления в одном месте'
            : 'Toate notificările dvs. într-un singur loc'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label={lang === 'ru' ? 'Все' : 'Toate'} />
          <Tab
            label={
              unreadCount > 0
                ? `${lang === 'ru' ? 'Непрочитанные' : 'Necitite'} (${unreadCount})`
                : lang === 'ru'
                ? 'Непрочитанные'
                : 'Necitite'
            }
          />
        </Tabs>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
            >
              {lang === 'ru' ? 'Прочитать все' : 'Marchează toate'}
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteAllRead}
          >
            {lang === 'ru' ? 'Очистить прочитанные' : 'Șterge citite'}
          </Button>
        </Box>
      </Box>

      {/* Notifications List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <NotificationsNoneIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {lang === 'ru' ? 'Нет уведомлений' : 'Fără notificări'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tab === 1
              ? lang === 'ru'
                ? 'У вас нет непрочитанных уведомлений'
                : 'Nu aveți notificări necitite'
              : lang === 'ru'
              ? 'Здесь будут появляться ваши уведомления'
              : 'Notificările dvs. vor apărea aici'}
          </Typography>
        </Box>
      ) : (
        <>
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              sx={{
                mb: 2,
                bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                cursor: notification.actionUrl ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': notification.actionUrl
                  ? { transform: 'translateX(4px)', boxShadow: 2 }
                  : {},
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flexShrink: 0 }}>{getNotificationIcon(notification.type)}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: notification.isRead ? 400 : 600 }}
                      >
                        {notification.title[lang]}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!notification.isRead && (
                          <Chip label={lang === 'ru' ? 'Новое' : 'Nou'} size="small" color="primary" />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteNotification(notification._id, e)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {notification.message[lang]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(notification.sentAt)}
                    </Typography>
                    {notification.actionText && notification.actionUrl && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Button size="small" variant="text">
                          {notification.actionText[lang]}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default NotificationsPage
