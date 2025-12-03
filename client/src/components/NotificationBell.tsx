import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import SchoolIcon from '@mui/icons-material/School'
import AnnouncementIcon from '@mui/icons-material/Announcement'
import QuizIcon from '@mui/icons-material/Quiz'
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

const NotificationBell = () => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const lang = i18n.language as 'ru' | 'ro'

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  const open = Boolean(anchorEl)

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadUnreadCount = async () => {
    try {
      const { unreadCount: count } = await getUnreadNotificationsCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const { notifications: notifs } = await getNotifications(1, 5, false)
      setNotifications(notifs)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    loadNotifications()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id)
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      handleClose()
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true)
      await markAllNotificationsAsRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setMarkingAllRead(false)
    }
  }

  const handleViewAll = () => {
    handleClose()
    navigate('/notifications')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement_unlocked':
        return <CheckCircleIcon color="success" />
      case 'certificate_ready':
        return <WorkspacePremiumIcon color="primary" />
      case 'new_content':
        return <SchoolIcon color="info" />
      case 'quiz_reminder':
        return <QuizIcon color="warning" />
      case 'system_announcement':
        return <AnnouncementIcon color="error" />
      default:
        return <NotificationsIcon />
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const sentDate = new Date(date)
    const seconds = Math.floor((now.getTime() - sentDate.getTime()) / 1000)

    if (seconds < 60) {
      return lang === 'ru' ? 'только что' : 'acum'
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return lang === 'ru' ? `${minutes} мин назад` : `acum ${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return lang === 'ru' ? `${hours} ч назад` : `acum ${hours} h`
    }

    const days = Math.floor(hours / 24)
    if (days < 7) {
      return lang === 'ru' ? `${days} д назад` : `acum ${days} zile`
    }

    return sentDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'ro-RO')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Tooltip title={lang === 'ru' ? 'Уведомления' : 'Notificări'}>
        <IconButton
          onClick={handleClick}
          sx={{ color: 'white' }}
          aria-label="notifications"
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {lang === 'ru' ? 'Уведомления' : 'Notificări'}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
            >
              {markingAllRead ? (
                <CircularProgress size={16} />
              ) : (
                lang === 'ru' ? 'Прочитать все' : 'Marchează toate'
              )}
            </Button>
          )}
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {lang === 'ru' ? 'Нет уведомлений' : 'Fără notificări'}
            </Typography>
          </Box>
        ) : (
          <>
            {notifications.map((notification) => (
              <MenuItem
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 1.5,
                  px: 2,
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: notification.isRead ? 400 : 600 }}
                    >
                      {notification.title[lang]}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {notification.message[lang]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(notification.sentAt)}
                      </Typography>
                    </>
                  }
                />
              </MenuItem>
            ))}
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button fullWidth onClick={handleViewAll}>
                {lang === 'ru' ? 'Посмотреть все' : 'Vezi toate'}
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  )
}

export default NotificationBell
