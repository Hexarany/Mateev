import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getMyGroups } from '@/services/api'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const MyGroupsPage = () => {
  const { token } = useAuth()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const language = i18n.language as 'ru' | 'ro'
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMyGroups()
  }, [])

  const loadMyGroups = async () => {
    try {
      if (!token) return
      setLoading(true)
      const data = await getMyGroups(token)
      setGroups(data)
    } catch (error: any) {
      console.error('Error loading groups:', error)
      setError(error.response?.data?.error?.message || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {language === 'ru' ? 'Мои группы' : 'Grupele mele'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {language === 'ru'
            ? 'Информация о ваших учебных группах'
            : 'Informații despre grupele dvs. de studiu'}
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {groups.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {language === 'ru' ? 'Вы не состоите ни в одной группе' : 'Nu faceți parte din niciun grup'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {language === 'ru'
              ? 'Свяжитесь с преподавателем для добавления в группу'
              : 'Contactați profesorul pentru a fi adăugat într-un grup'}
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {groups.map((group) => {
          const teacher = group.teacher as any
          const students = group.students as any[]
          const startDate = new Date(group.startDate)
          const endDate = group.endDate ? new Date(group.endDate) : null
          const now = new Date()
          const isActive = group.isActive && now >= startDate && (!endDate || now <= endDate)

          return (
            <Grid item xs={12} key={group._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {group.name[language]}
                      </Typography>
                      {group.description && group.description[language] && (
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {group.description[language]}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={
                        isActive
                          ? language === 'ru' ? 'Активная' : 'Activă'
                          : language === 'ru' ? 'Неактивная' : 'Inactivă'
                      }
                      color={isActive ? 'success' : 'default'}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={3}>
                    {/* Преподаватель */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                          {language === 'ru' ? 'Преподаватель' : 'Profesor'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {teacher?.firstName} {teacher?.lastName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {teacher?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Даты */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                          {language === 'ru' ? 'Период обучения' : 'Perioada de studiu'}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        <strong>{language === 'ru' ? 'Начало:' : 'Început:'}</strong> {formatDate(group.startDate)}
                      </Typography>
                      {endDate && (
                        <Typography variant="body2">
                          <strong>{language === 'ru' ? 'Окончание:' : 'Sfârșit:'}</strong> {formatDate(group.endDate)}
                        </Typography>
                      )}
                    </Grid>

                    {/* Студенты */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                          {language === 'ru' ? 'Студенты' : 'Studenți'} ({students.length})
                        </Typography>
                      </Box>
                      <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                        <List dense>
                          {students.map((student, index) => (
                            <ListItem key={student._id || index}>
                              <ListItemAvatar>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                  {student.firstName?.[0]}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`${student.firstName} ${student.lastName}`}
                                secondary={student.email}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Container>
  )
}

export default MyGroupsPage
