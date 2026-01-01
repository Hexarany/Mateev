import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  MenuBook as BookIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import { useProgress } from '@/hooks/useProgress'
import StreakCounter from '@/components/StreakCounter'
import AchievementBadge from '@/components/AchievementBadge'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const lang = user?.language || 'ru'
  const { data: progress, isLoading, error } = useProgress()

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {lang === 'ru' ? 'Ошибка загрузки прогресса' : 'Eroare la încărcarea progresului'}
        </Alert>
      </Container>
    )
  }

  if (!progress) return null

  const { stats, achievements, completedQuizzes } = progress

  // Format study time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}${lang === 'ru' ? 'ч' : 'h'} ${minutes}${lang === 'ru' ? 'м' : 'm'}`
    }
    return `${minutes}${lang === 'ru' ? 'м' : 'm'}`
  }

  // Stats cards data
  const statsCards = [
    {
      title: lang === 'ru' ? 'Изучено тем' : 'Teme studiate',
      value: stats.totalTopicsCompleted,
      icon: BookIcon,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: lang === 'ru' ? 'Пройдено тестов' : 'Teste trecute',
      value: stats.totalQuizzesPassed,
      icon: QuizIcon,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      title: lang === 'ru' ? 'Средний балл' : 'Scor mediu',
      value: `${stats.averageQuizScore}%`,
      icon: TrendingUpIcon,
      color: '#ed6c02',
      bgColor: '#fff3e0',
    },
    {
      title: lang === 'ru' ? 'Время обучения' : 'Timp de studiu',
      value: formatTime(stats.totalStudyTime),
      icon: TimerIcon,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
    },
  ]

  // Content progress pie chart data
  const contentData = [
    {
      name: lang === 'ru' ? 'Темы' : 'Teme',
      value: stats.totalTopicsCompleted,
      color: '#1976d2',
    },
    {
      name: lang === 'ru' ? 'Протоколы' : 'Protocoale',
      value: progress.viewedProtocols.length,
      color: '#2e7d32',
    },
    {
      name: lang === 'ru' ? 'Гигиена' : 'Igienă',
      value: progress.viewedGuidelines.length,
      color: '#ed6c02',
    },
    {
      name: lang === 'ru' ? '3D модели' : 'Modele 3D',
      value: progress.viewed3DModels.length,
      color: '#9c27b0',
    },
    {
      name: lang === 'ru' ? 'Триггеры' : 'Triggere',
      value: progress.viewedTriggerPoints.length,
      color: '#d32f2f',
    },
  ].filter((item) => item.value > 0)

  // Recent quiz scores for bar chart
  const recentQuizScores = completedQuizzes
    .slice(-7)
    .reverse()
    .map((quiz, index) => ({
      name: `${lang === 'ru' ? 'Тест' : 'Test'} ${completedQuizzes.length - index}`,
      score: quiz.score,
    }))

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {lang === 'ru' ? 'Мой прогресс' : 'Progresul meu'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {lang === 'ru'
            ? 'Отслеживайте свои достижения и прогресс в обучении'
            : 'Urmăriți-vă realizările și progresul în învățare'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Streak Counter */}
        <Grid item xs={12} md={6}>
          <StreakCounter currentStreak={stats.streak} longestStreak={stats.longestStreak} />
        </Grid>

        {/* Last Activity */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)',
              border: '2px solid #667eea40',
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#667eea20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarIcon sx={{ fontSize: 40, color: '#667eea' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {lang === 'ru' ? 'Последняя активность' : 'Ultima activitate'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(stats.lastActivityDate).toLocaleDateString(
                    lang === 'ru' ? 'ru-RU' : 'ro-RO',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="textSecondary">
              {lang === 'ru'
                ? 'Продолжайте заниматься каждый день, чтобы увеличить свою серию!'
                : 'Continuați să studiați în fiecare zi pentru a vă crește seria!'}
            </Typography>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${stat.bgColor} 0%, white 100%)`,
                  border: `1px solid ${stat.color}20`,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      mb: 1.5,
                    }}
                  >
                    <Icon sx={{ color: stat.color, fontSize: 28 }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={stat.color} gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}

        {/* Content Progress Pie Chart */}
        {contentData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {lang === 'ru' ? 'Изученный контент' : 'Conținut studiat'}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Recent Quiz Scores Bar Chart */}
        {recentQuizScores.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {lang === 'ru' ? 'Последние результаты тестов' : 'Ultimele rezultate ale testelor'}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recentQuizScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Bar dataKey="score" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
              {stats.averageQuizScore > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    {lang === 'ru' ? 'Средний балл:' : 'Scor mediu:'} {stats.averageQuizScore}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.averageQuizScore}
                    sx={{
                      mt: 0.5,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e3f2fd',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: stats.averageQuizScore >= 80 ? '#2e7d32' : '#1976d2',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Achievements Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <TrophyIcon sx={{ fontSize: 32, color: '#ffd700' }} />
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {lang === 'ru' ? 'Достижения' : 'Realizări'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {lang === 'ru'
                    ? `Получено: ${achievements.length} достижений`
                    : `Obținute: ${achievements.length} realizări`}
                </Typography>
              </Box>
            </Box>

            {achievements.length === 0 ? (
              <Alert severity="info">
                {lang === 'ru'
                  ? 'Начните обучение, чтобы получить свои первые достижения!'
                  : 'Începeți să studiați pentru a obține primele realizări!'}
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {achievements.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={achievement.achievementId}>
                    <AchievementBadge achievement={achievement} size="medium" />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
