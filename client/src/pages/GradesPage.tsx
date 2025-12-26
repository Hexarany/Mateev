import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { getMySubmissions } from '@/services/api'
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
  LinearProgress,
  Alert,
  Grid,
} from '@mui/material'
import GradeIcon from '@mui/icons-material/Grade'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const GradesPage = () => {
  const { token } = useAuth()
  const { i18n } = useTranslation()
  const language = i18n.language as 'ru' | 'ro'
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMySubmissions()
  }, [])

  const loadMySubmissions = async () => {
    try {
      if (!token) return
      setLoading(true)
      const data = await getMySubmissions(token)
      setSubmissions(data)
      setError(null)
    } catch (error: any) {
      console.error('Error loading submissions:', error)
      setError(error.response?.data?.error?.message || error.response?.data?.message || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" gutterBottom>
          {language === 'ru' ? 'Мои оценки' : 'Notele mele'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {language === 'ru'
            ? 'Все ваши оценки и статистика'
            : 'Toate notele și statisticile dvs.'}
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      {gradedSubmissions.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
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
                <GradeIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
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
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
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
                <CheckCircleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
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
            '& .MuiTable-root': {
              minWidth: { xs: 600, sm: 750, md: 'auto' },
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>{language === 'ru' ? 'Задание' : 'Sarcină'}</strong>
                </TableCell>
                <TableCell>
                  <strong>{language === 'ru' ? 'Группа' : 'Grup'}</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>{language === 'ru' ? 'Оценка' : 'Nota'}</strong>
                </TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <strong>{language === 'ru' ? 'Процент' : 'Procent'}</strong>
                </TableCell>
                <TableCell>
                  <strong>{language === 'ru' ? 'Дата сдачи' : 'Data predării'}</strong>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <strong>{language === 'ru' ? 'Комментарий' : 'Comentariu'}</strong>
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
                  <TableRow key={submission._id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {assignment.title[language]}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {assignment.group?.name?.[language] || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${submission.grade} / ${assignment.maxScore}`}
                        color={gradeColor}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          color: `${gradeColor}.main`,
                        }}
                      >
                        {percentage.toFixed(0)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(submission.submittedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ maxWidth: 300 }}>
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
        !loading && (
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
