import { useState } from 'react'
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
} from '@mui/material'
import {
  CalendarMonth as CalendarIcon,
  Schedule as ClockIcon,
  Group as GroupIcon,
  Room as LocationIcon,
  Topic as TopicIcon,
  ViewList as ListIcon,
  CalendarViewMonth as CalendarViewIcon,
} from '@mui/icons-material'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ru, ro } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'

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

  const lang = user?.language || 'ru'

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

  // Convert schedule to calendar events
  const calendarEvents: CalendarEvent[] = schedule.map((lesson) => {
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4">
              {lang === 'ru' ? 'Моё расписание' : 'Orarul meu'}
            </Typography>
          </Box>

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

        {schedule.length === 0 ? (
          <Alert severity="info">
            {lang === 'ru'
              ? 'У вас пока нет запланированных занятий'
              : 'Nu aveți lecții programate încă'}
          </Alert>
        ) : (
          <>
            {viewMode === 'list' ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {lang === 'ru'
                    ? 'Показаны последние 3 прошедших занятия и все предстоящие'
                    : 'Se afișează ultimele 3 lecții trecute și toate lecțiile viitoare'}
                </Typography>

                <List>
                  {schedule.map((lesson, index) => {
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
                    backgroundColor: 'primary.main',
                    borderRadius: '4px',
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  },
                  '& .rbc-today': {
                    backgroundColor: 'action.hover',
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
      </Paper>
    </Container>
  )
}
