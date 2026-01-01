import { Box, Paper, Typography, LinearProgress, Tooltip } from '@mui/material'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { useAuth } from '@/contexts/AuthContext'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
}

export default function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  const { user } = useAuth()
  const lang = user?.language || 'ru'

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#ff6b00' // Огненный оранжевый
    if (streak >= 14) return '#ff9500' // Оранжевый
    if (streak >= 7) return '#ffa500' // Светло-оранжевый
    if (streak >= 3) return '#ffb733' // Желто-оранжевый
    return '#ffd700' // Золотой
  }

  const getStreakTitle = (streak: number) => {
    if (streak >= 30)
      return lang === 'ru' ? 'Невероятная серия! 🔥🔥🔥' : 'Serie incredibilă! 🔥🔥🔥'
    if (streak >= 14) return lang === 'ru' ? 'Огненная серия! 🔥🔥' : 'Serie de foc! 🔥🔥'
    if (streak >= 7) return lang === 'ru' ? 'Отличная серия! 🔥' : 'Serie excelentă! 🔥'
    if (streak >= 3) return lang === 'ru' ? 'Хорошая серия!' : 'Serie bună!'
    if (streak >= 1) return lang === 'ru' ? 'Начало серии' : 'Începutul seriei'
    return lang === 'ru' ? 'Начни обучение сегодня' : 'Începe să studiezi astăzi'
  }

  const getNextMilestone = (streak: number) => {
    if (streak < 3) return 3
    if (streak < 7) return 7
    if (streak < 14) return 14
    if (streak < 30) return 30
    if (streak < 60) return 60
    if (streak < 100) return 100
    return streak + 30
  }

  const nextMilestone = getNextMilestone(currentStreak)
  const progress = (currentStreak / nextMilestone) * 100

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        background: `linear-gradient(135deg, ${getStreakColor(currentStreak)}15 0%, ${getStreakColor(currentStreak)}05 100%)`,
        border: `2px solid ${getStreakColor(currentStreak)}40`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${getStreakColor(currentStreak)}10 0%, transparent 70%)`,
          borderRadius: '50%',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${getStreakColor(currentStreak)}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WhatshotIcon
              sx={{
                fontSize: 40,
                color: getStreakColor(currentStreak),
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" fontWeight={700} color={getStreakColor(currentStreak)}>
              {currentStreak}
              <Typography
                component="span"
                variant="h6"
                sx={{ ml: 1, color: 'text.secondary', fontWeight: 400 }}
              >
                {lang === 'ru' ? 'дней' : 'zile'}
              </Typography>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {getStreakTitle(currentStreak)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="textSecondary">
              {lang === 'ru' ? 'До следующей цели:' : 'Până la următorul obiectiv:'}{' '}
              {nextMilestone - currentStreak} {lang === 'ru' ? 'дней' : 'zile'}
            </Typography>
            <Typography variant="caption" fontWeight={600} color={getStreakColor(currentStreak)}>
              {nextMilestone} {lang === 'ru' ? 'дней' : 'zile'}
            </Typography>
          </Box>
          <Tooltip
            title={`${currentStreak} / ${nextMilestone} ${lang === 'ru' ? 'дней' : 'zile'}`}
            arrow
          >
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: `${getStreakColor(currentStreak)}20`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: getStreakColor(currentStreak),
                  borderRadius: 4,
                },
              }}
            />
          </Tooltip>
        </Box>

        {longestStreak > currentStreak && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="textSecondary">
              {lang === 'ru' ? 'Рекорд:' : 'Record:'}{' '}
              <Typography component="span" variant="caption" fontWeight={600}>
                {longestStreak} {lang === 'ru' ? 'дней' : 'zile'}
              </Typography>
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
