import { Box, Card, CardContent, Typography, Tooltip } from '@mui/material'
import { Achievement } from '@/hooks/useProgress'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { ru, ro } from 'date-fns/locale'

interface AchievementBadgeProps {
  achievement: Achievement
  locked?: boolean
  size?: 'small' | 'medium' | 'large'
}

export default function AchievementBadge({
  achievement,
  locked = false,
  size = 'medium',
}: AchievementBadgeProps) {
  const { user } = useAuth()
  const lang = user?.language || 'ru'
  const locale = lang === 'ru' ? ru : ro

  const sizeConfig = {
    small: {
      iconSize: 32,
      padding: 1.5,
      titleVariant: 'caption' as const,
      descVariant: 'caption' as const,
    },
    medium: {
      iconSize: 48,
      padding: 2,
      titleVariant: 'body1' as const,
      descVariant: 'body2' as const,
    },
    large: {
      iconSize: 64,
      padding: 3,
      titleVariant: 'h6' as const,
      descVariant: 'body1' as const,
    },
  }

  const config = sizeConfig[size]

  const formattedDate = achievement.unlockedAt
    ? format(new Date(achievement.unlockedAt), 'd MMMM yyyy', { locale })
    : ''

  return (
    <Tooltip
      title={
        locked ? (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {achievement.title[lang]}
            </Typography>
            <Typography variant="caption">{achievement.description[lang]}</Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {achievement.title[lang]}
            </Typography>
            <Typography variant="caption" display="block">
              {achievement.description[lang]}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
              {lang === 'ru' ? 'Получено:' : 'Obținut:'} {formattedDate}
            </Typography>
          </Box>
        )
      }
      arrow
      placement="top"
    >
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          opacity: locked ? 0.4 : 1,
          filter: locked ? 'grayscale(100%)' : 'none',
          '&:hover': {
            transform: locked ? 'none' : 'translateY(-4px) scale(1.02)',
            boxShadow: locked ? 1 : 6,
          },
          background: locked
            ? 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
            : 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
          border: locked ? '2px dashed #ccc' : '2px solid #ffd700',
          '&::before': locked
            ? {}
            : {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                background: 'radial-gradient(circle, #ffd70030 0%, transparent 70%)',
                borderRadius: '50%',
              },
        }}
      >
        <CardContent
          sx={{
            p: config.padding,
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            '&:last-child': { pb: config.padding },
          }}
        >
          <Box
            sx={{
              fontSize: config.iconSize,
              mb: 1,
              lineHeight: 1,
              filter: locked ? 'none' : 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3))',
            }}
          >
            {locked ? '🔒' : achievement.icon}
          </Box>
          <Typography variant={config.titleVariant} fontWeight={700} gutterBottom>
            {achievement.title[lang]}
          </Typography>
          <Typography variant={config.descVariant} color="text.secondary" sx={{ lineHeight: 1.3 }}>
            {achievement.description[lang]}
          </Typography>
          {!locked && size !== 'small' && (
            <Typography variant="caption" sx={{ mt: 1, opacity: 0.6, display: 'block' }}>
              {formattedDate}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Tooltip>
  )
}
