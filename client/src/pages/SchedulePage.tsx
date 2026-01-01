import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMySchedule } from '../hooks/useSchedule'
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Divider,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
} from '@mui/material'
import {
  CalendarMonth as CalendarIcon,
  Schedule as ClockIcon,
  Group as GroupIcon,
  Room as LocationIcon,
  Topic as TopicIcon,
  ViewList as ListIcon,
  CalendarViewMonth as CalendarViewIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
  NoteAdd as NoteAddIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ru, ro } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { exportToICalendar } from '../utils/icalendar'

interface ScheduleEntry {
  _id: string
  lessonNumber: number
  title: { ru: string; ro: string }
  date: string
  duration: string
  location?: string
  group: {
    _id: string
    name: { ru: string; ro: string }
  }
  topic?: {
    _id: string
    name: { ru: string; ro: string }
    description?: { ru: string; ro: string }
  }
}

interface CalendarEvent extends Event {
  resource: ScheduleEntry
}

const locales = {
  ru: ru,
  ro: ro,
}

export default function SchedulePage() {
  const { user } = useAuth()
  const { data: schedule = [], isLoading, error } = useMySchedule()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationMinutes, setNotificationMinutes] = useState(30)
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false)
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>({})
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<ScheduleEntry | null>(null)
  const [currentNote, setCurrentNote] = useState('')

  const lang = user?.language || 'ru'

  // Load saved preferences
  useEffect(() => {
    const savedNotificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true'
    const savedNotificationMinutes = parseInt(localStorage.getItem('notificationMinutes') || '30')
    const savedNotes = localStorage.getItem('lessonNotes')

    setNotificationsEnabled(savedNotificationsEnabled)
    setNotificationMinutes(savedNotificationMinutes)
    if (savedNotes) {
      setLessonNotes(JSON.parse(savedNotes))
    }

    // Request notification permission if enabled
    if (savedNotificationsEnabled && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [])

  // Check for upcoming lessons and send notifications
  useEffect(() => {
    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const checkInterval = setInterval(() => {
      const now = new Date()
      const upcomingLessons = schedule.filter(lesson => {
        const lessonTime = new Date(lesson.date)
        const timeDiff = lessonTime.getTime() - now.getTime()
        const minutesDiff = timeDiff / 1000 / 60
        return minutesDiff > 0 && minutesDiff <= notificationMinutes
      })

      upcomingLessons.forEach(lesson => {
        const notificationKey = `notified-${lesson._id}`
        if (!localStorage.getItem(notificationKey)) {
          new Notification(lang === 'ru' ? 'Напоминание о занятии' : 'Memento despre lecție', {
            body: `${getLocalizedText(lesson.title)} - ${getLocalizedText(lesson.group.name)}`,
            icon: '/anatomy-icon.svg',
            tag: lesson._id,
          })
          localStorage.setItem(notificationKey, 'true')
        }
      })
    }, 60000) // Check every minute

    return () => clearInterval(checkInterval)
  }, [notificationsEnabled, notificationMinutes, schedule, lang])

  // Save notifications settings
  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    localStorage.setItem('notificationsEnabled', String(enabled))

    if (enabled && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          setNotificationsEnabled(false)
          localStorage.setItem('notificationsEnabled', 'false')
          alert(lang === 'ru' ? 'Разрешите уведомления в настройках браузера' : 'Permiteți notificările în setările browserului')
        }
      })
    }
  }

  const handleNotificationMinutesChange = (minutes: number) => {
    setNotificationMinutes(minutes)
    localStorage.setItem('notificationMinutes', String(minutes))
  }

  // Handle notes
  const handleOpenNoteDialog = (lesson: ScheduleEntry) => {
    setSelectedLesson(lesson)
    setCurrentNote(lessonNotes[lesson._id] || '')
    setNoteDialogOpen(true)
  }

  const handleSaveNote = () => {
    if (!selectedLesson) return

    const updatedNotes = {
      ...lessonNotes,
      [selectedLesson._id]: currentNote,
    }
    setLessonNotes(updatedNotes)
    localStorage.setItem('lessonNotes', JSON.stringify(updatedNotes))
    setNoteDialogOpen(false)
    setSelectedLesson(null)
    setCurrentNote('')
  }

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: locales[lang] }),
    getDay,
    locales,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const locale = lang === 'ru' ? 'ru-RU' : 'ro-RO'

    const dateStr = date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })

    const timeStr = date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })

    return { dateStr, timeStr }
  }

  const getLocalizedText = (text: { ru: string; ro: string } | string | undefined) => {
    if (!text) return ''
    if (typeof text === 'string') return text
    return text[lang] || text.ru || ''
  }

  // Filter schedule by selected group
  const filteredSchedule = selectedGroup === 'all'
    ? schedule
    : schedule.filter(lesson => lesson.group._id === selectedGroup)

  // Get unique groups for filter
  const uniqueGroups = Array.from(
    new Map(schedule.map(lesson => [lesson.group._id, lesson.group])).values()
  )

  // Export to iCalendar
  const handleExportICalendar = () => {
    const events = filteredSchedule.map(lesson => {
      const startDate = new Date(lesson.date)
      const durationMinutes = parseInt(lesson.duration) || 90
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000)

      return {
        title: `${lang === 'ru' ? 'Занятие' : 'Lecția'} ${lesson.lessonNumber}: ${getLocalizedText(lesson.title)}`,
        description: `${lang === 'ru' ? 'Группа' : 'Grup'}: ${getLocalizedText(lesson.group.name)}${
          lesson.topic ? `\n${lang === 'ru' ? 'Тема' : 'Temă'}: ${getLocalizedText(lesson.topic.name)}` : ''
        }${
          lessonNotes[lesson._id] ? `\n${lang === 'ru' ? 'Заметки' : 'Notițe'}: ${lessonNotes[lesson._id]}` : ''
        }`,
        location: lesson.location || '',
        start: startDate,
        end: endDate,
        uid: lesson._id,
      }
    })

    exportToICalendar(
      events,
      `schedule-${new Date().toISOString().split('T')[0]}.ics`,
      lang === 'ru' ? 'Расписание занятий' : 'Orarul lecțiilor'
    )
  }

  // Convert filtered schedule to calendar events
  const calendarEvents: CalendarEvent[] = filteredSchedule.map((lesson) => {
    const startDate = new Date(lesson.date)
    const durationMinutes = parseInt(lesson.duration) || 90
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)

    return {
      title: `${lang === 'ru' ? 'Занятие' : 'Lecția'} ${lesson.lessonNumber}: ${getLocalizedText(lesson.title)}`,
      start: startDate,
      end: endDate,
      resource: lesson,
    }
  })

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const lesson = event.resource
    return (
      <Box sx={{ p: 0.5 }}>
        <Typography variant="caption" fontWeight="bold" display="block">
          {getLocalizedText(lesson.title)}
        </Typography>
        <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
          {getLocalizedText(lesson.group.name)}
        </Typography>
      </Box>
    )
  }

  const messages = {
    today: lang === 'ru' ? 'Сегодня' : 'Astăzi',
    previous: lang === 'ru' ? 'Назад' : 'Înapoi',
    next: lang === 'ru' ? 'Вперед' : 'Înainte',
    month: lang === 'ru' ? 'Месяц' : 'Luna',
    week: lang === 'ru' ? 'Неделя' : 'Săptămâna',
    day: lang === 'ru' ? 'День' : 'Ziua',
    agenda: lang === 'ru' ? 'Повестка' : 'Agenda',
    date: lang === 'ru' ? 'Дата' : 'Data',
    time: lang === 'ru' ? 'Время' : 'Ora',
    event: lang === 'ru' ? 'Событие' : 'Eveniment',
    noEventsInRange: lang === 'ru' ? 'Нет занятий в этом диапазоне' : 'Nu există lecții în acest interval',
    showMore: (total: number) => `+ еще ${total}`,
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} />
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, boxShadow: 3 }}>
        {/* Header with controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ fontSize: 32, mr: 2, color: (theme) => theme.palette.primary.main }} />
            <Typography variant="h4">
              {lang === 'ru' ? 'Моё расписание' : 'Orarul meu'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExportICalendar}
              disabled={filteredSchedule.length === 0}
              variant="outlined"
            >
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {lang === 'ru' ? 'Экспорт' : 'Export'}
              </Box>
            </Button>
            <Button
              size="small"
              startIcon={<NotificationsIcon />}
              onClick={() => setNotificationsDialogOpen(true)}
              variant="outlined"
              color={notificationsEnabled ? 'success' : 'inherit'}
            >
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {lang === 'ru' ? 'Напоминания' : 'Memento-uri'}
              </Box>
            </Button>
          </Box>
        </Box>

        {/* Filters and view toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{lang === 'ru' ? 'Группа' : 'Grup'}</InputLabel>
            <Select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              label={lang === 'ru' ? 'Группа' : 'Grup'}
            >
              <MenuItem value="all">{lang === 'ru' ? 'Все группы' : 'Toate grupurile'}</MenuItem>
              {uniqueGroups.map(group => (
                <MenuItem key={group._id} value={group._id}>
                  {getLocalizedText(group.name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: { xs: 1.5, sm: 2 },
                py: 0.5,
              },
            }}
          >
            <ToggleButton value="list">
              <ListIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {lang === 'ru' ? 'Список' : 'Listă'}
              </Box>
            </ToggleButton>
            <ToggleButton value="calendar">
              <CalendarViewIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {lang === 'ru' ? 'Календарь' : 'Calendar'}
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'Ошибка при загрузке расписания'}
          </Alert>
        )}

        {filteredSchedule.length === 0 ? (
          <Alert severity="info">
            {selectedGroup !== 'all'
              ? (lang === 'ru' ? 'Нет занятий для выбранной группы' : 'Nu există lecții pentru grupul selectat')
              : (lang === 'ru' ? 'У вас пока нет запланированных занятий' : 'Nu aveți lecții programate încă')}
          </Alert>
        ) : (
          <>
            {viewMode === 'list' ? (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {lang === 'ru'
                    ? `Показано занятий: ${filteredSchedule.length}`
                    : `Afișate lecții: ${filteredSchedule.length}`}
                </Typography>

                <List>
                  {filteredSchedule.map((lesson, index) => {
                    const { dateStr, timeStr } = formatDate(lesson.date)
                    const isPast = new Date(lesson.date) < new Date()

                    return (
                      <Box key={lesson._id}>
                        <ListItem
                          sx={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            bgcolor: isPast ? 'grey.50' : 'background.paper',
                            borderRadius: 1,
                            mb: 1,
                            opacity: isPast ? 0.7 : 1,
                          }}
                        >
                          <Box sx={{ width: '100%', mb: 1 }}>
                            <Typography variant="h6" component="div">
                              {lang === 'ru' ? 'Занятие' : 'Lecția'} {lesson.lessonNumber}:{' '}
                              {getLocalizedText(lesson.title)}
                            </Typography>
                            {isPast && (
                              <Chip
                                label={lang === 'ru' ? 'Прошедшее' : 'Trecut'}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>

                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <GroupIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {getLocalizedText(lesson.group.name)}
                                  </Typography>
                                </Box>

                                {lesson.topic && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TopicIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                      {getLocalizedText(lesson.topic.name)}
                                    </Typography>
                                  </Box>
                                )}

                                {lesson.location && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{lesson.location}</Typography>
                                  </Box>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CalendarIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {dateStr} {timeStr}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ClockIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {lang === 'ru' ? 'Длительность' : 'Durata'}: {lesson.duration}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < schedule.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    )
                  })}
                </List>
              </>
            ) : (
              <Box
                sx={{
                  height: { xs: 500, sm: 600, md: 700 },
                  '& .rbc-calendar': {
                    fontFamily: 'inherit',
                  },
                  '& .rbc-header': {
                    padding: { xs: '6px', sm: '10px' },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600,
                  },
                  '& .rbc-event': {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    borderRadius: '4px',
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  },
                  '& .rbc-today': {
                    backgroundColor: (theme) => theme.palette.action.hover,
                  },
                  '& .rbc-toolbar button': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    padding: { xs: '4px 8px', sm: '6px 12px' },
                  },
                  '& .rbc-month-view, & .rbc-time-view, & .rbc-agenda-view': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  },
                }}
              >
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  culture={lang}
                  messages={messages}
                  defaultView="month"
                  views={['month', 'week', 'day', 'agenda']}
                  components={{
                    event: EventComponent,
                  }}
                  style={{ height: '100%' }}
                />
              </Box>
            )}
          </>
        )}

        {/* Notifications Settings Dialog */}
        <Dialog open={notificationsDialogOpen} onClose={() => setNotificationsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {lang === 'ru' ? 'Настройки напоминаний' : 'Setări memento-uri'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationsEnabled}
                    onChange={(e) => handleNotificationsToggle(e.target.checked)}
                  />
                }
                label={lang === 'ru' ? 'Включить уведомления' : 'Activează notificările'}
              />

              {notificationsEnabled && (
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel>{lang === 'ru' ? 'Напоминать за' : 'Amintește cu'}</InputLabel>
                  <Select
                    value={notificationMinutes}
                    onChange={(e) => handleNotificationMinutesChange(Number(e.target.value))}
                    label={lang === 'ru' ? 'Напоминать за' : 'Amintește cu'}
                  >
                    <MenuItem value={5}>5 {lang === 'ru' ? 'минут' : 'minute'}</MenuItem>
                    <MenuItem value={15}>15 {lang === 'ru' ? 'минут' : 'minute'}</MenuItem>
                    <MenuItem value={30}>30 {lang === 'ru' ? 'минут' : 'minute'}</MenuItem>
                    <MenuItem value={60}>1 {lang === 'ru' ? 'час' : 'oră'}</MenuItem>
                    <MenuItem value={120}>2 {lang === 'ru' ? 'часа' : 'ore'}</MenuItem>
                  </Select>
                </FormControl>
              )}

              {notificationsEnabled && 'Notification' in window && Notification.permission !== 'granted' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {lang === 'ru'
                    ? 'Разрешите уведомления в настройках браузера'
                    : 'Permiteți notificările în setările browserului'}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotificationsDialogOpen(false)}>
              {lang === 'ru' ? 'Закрыть' : 'Închide'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {lang === 'ru' ? 'Заметка к занятию' : 'Notiță pentru lecție'}
          </DialogTitle>
          <DialogContent>
            {selectedLesson && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {getLocalizedText(selectedLesson.title)}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder={lang === 'ru' ? 'Введите заметку...' : 'Introduceți notița...'}
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteDialogOpen(false)}>
              {lang === 'ru' ? 'Отмена' : 'Anulare'}
            </Button>
            <Button onClick={handleSaveNote} variant="contained">
              {lang === 'ru' ? 'Сохранить' : 'Salvează'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  )
}
