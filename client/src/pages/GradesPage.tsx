import { useTranslation } from 'react-i18next'
import { useMyAssignments } from '@/hooks/useAssignments'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Grid,
  Skeleton,
} from '@mui/material'
import GradeIcon from '@mui/icons-material/Grade'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const GradesPage = () => {
  const { i18n } = useTranslation()
  const language = i18n.language as 'ru' | 'ro'
  const { data: submissions = [], isLoading, error } = useMyAssignments()

  // Фильтруем только проверенные работы
  const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null)

  // Вычисляем статистику
  const stats = {
    total: gradedSubmissions.length,
    averageGrade: gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length
      : 0,
    averagePercentage: gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => {
          const assignment = s.assignment
          return sum + ((s.grade / assignment.maxScore) * 100)
        }, 0) / gradedSubmissions.length
      : 0,
    totalPossiblePoints: gradedSubmissions.reduce((sum, s) => sum + s.assignment.maxScore, 0),
    totalEarnedPoints: gradedSubmissions.reduce((sum, s) => sum + s.grade, 0),
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success'
    if (percentage >= 70) return 'info'
    if (percentage >= 50) return 'warning'
    return 'error'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((n) => (
            <Grid item xs={12} sm={6} md={3} key={n}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={48} sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="80%" height={24} sx={{ mx: 'auto' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
          {language === 'ru' ? 'Мои оценки' : 'Notele mele'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {language === 'ru'
            ? 'Все ваши оценки и статистика'
            : 'Toate notele și statisticile dvs.'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'Ошибка загрузки оценок'}
        </Alert>
      )}

      {/* Статистика */}
      {gradedSubmissions.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {language === 'ru' ? 'Проверено работ' : 'Lucrări verificate'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <GradeIcon sx={{ fontSize: 40, color: (theme) => theme.palette.success.main, mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {stats.averageGrade.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {language === 'ru' ? 'Средний балл' : 'Nota medie'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: (theme) => theme.palette.info.main, mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {stats.averagePercentage.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {language === 'ru' ? 'Средний %' : '% mediu'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: (theme) => theme.palette.warning.main, mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {stats.totalEarnedPoints} / {stats.totalPossiblePoints}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {language === 'ru' ? 'Всего баллов' : 'Total puncte'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Таблица оценок */}
      {gradedSubmissions.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{
            overflowX: 'auto',
            maxWidth: '100%',
            borderRadius: 2,
            boxShadow: 2,
            '& .MuiTable-root': {
              minWidth: { xs: 650, sm: 750, md: 'auto' },
            },
            '& .MuiTableCell-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '8px 6px', sm: '12px 16px' },
            },
            '& .MuiTableCell-head': {
              fontWeight: 600,
              backgroundColor: (theme) => theme.palette.action.hover,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  {language === 'ru' ? 'Задание' : 'Sarcină'}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {language === 'ru' ? 'Группа' : 'Grup'}
                </TableCell>
                <TableCell align="center">
                  {language === 'ru' ? 'Оценка' : 'Nota'}
                </TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {language === 'ru' ? 'Процент' : 'Procent'}
                </TableCell>
                <TableCell>
                  {language === 'ru' ? 'Дата' : 'Data'}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                  {language === 'ru' ? 'Комментарий' : 'Comentariu'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gradedSubmissions.map((submission) => {
                const assignment = submission.assignment
                if (!assignment) return null

                const percentage = (submission.grade / assignment.maxScore) * 100
                const gradeColor = getGradeColor(percentage)

                return (
                  <TableRow key={submission._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {assignment.title[language]}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {assignment.group?.name?.[language] || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${submission.grade}/${assignment.maxScore}`}
                        color={gradeColor}
                        size="small"
                        sx={{
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          height: { xs: 20, sm: 24 },
                          '& .MuiChip-label': {
                            px: { xs: 0.5, sm: 1 },
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          color: `${gradeColor}.main`,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}
                      >
                        {percentage.toFixed(0)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                        {formatDate(submission.submittedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ maxWidth: 300, fontSize: '0.875rem' }}>
                        {submission.feedback || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        !isLoading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <GradeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              {language === 'ru' ? 'Нет проверенных работ' : 'Nu există lucrări verificate'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {language === 'ru'
                ? 'Ваши оценки появятся здесь после проверки работ преподавателем'
                : 'Notele dvs. vor apărea aici după verificarea lucrărilor de către profesor'}
            </Typography>
          </Paper>
        )
      )}
    </Container>
  )
}

export default GradesPage
