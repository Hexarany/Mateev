import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMyGroups } from '@/hooks/useGroups'
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
  Alert,
  Paper,
  Divider,
  Skeleton,
} from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const MyGroupsPage = () => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const language = i18n.language as 'ru' | 'ro'
  const { data: groups = [], isLoading, error } = useMyGroups()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2].map((n) => (
            <Grid item xs={12} key={n}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" gutterBottom>
          {language === 'ru' ? 'Мои группы' : 'Grupele mele'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {language === 'ru'
            ? 'Информация о ваших учебных группах'
            : 'Informații despre grupele dvs. de studiu'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'Ошибка загрузки'}
        </Alert>
      )}

      {groups.length === 0 && (
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
                        <SchoolIcon sx={{ mr: 1, color: (theme) => theme.palette.primary.main }} />
                        <Typography variant="h6">
                          {language === 'ru' ? 'Преподаватель' : 'Profesor'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main }}>
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
                        <CalendarTodayIcon sx={{ mr: 1, color: (theme) => theme.palette.primary.main }} />
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
                        <GroupIcon sx={{ mr: 1, color: (theme) => theme.palette.primary.main }} />
                        <Typography variant="h6">
                          {language === 'ru' ? 'Студенты' : 'Studenți'} ({students.length})
                        </Typography>
                      </Box>
                      <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                        <List dense>
                          {students.map((student, index) => (
                            <ListItem key={student._id || index}>
                              <ListItemAvatar>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: (theme) => theme.palette.secondary.main }}>
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
