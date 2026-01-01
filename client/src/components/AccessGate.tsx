import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Chip,
  Stack,
} from '@mui/material'
import {
  Lock as LockIcon,
  Star as StarIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'

interface AccessGateProps {
  requiredTier: 'free' | 'basic' | 'premium'
  children: ReactNode
  preview?: string
  contentType?: string
}

const AccessGate = ({ requiredTier, children, preview, contentType = 'контент' }: AccessGateProps) => {
  const navigate = useNavigate()
  const { user, hasAccess, isAuthenticated } = useAuth()

  // Check if user has access
  if (hasAccess(requiredTier)) {
    return <>{children}</>
  }

  // User doesn't have access - show locked content
  const tierNames: { [key: string]: string } = {
    basic: 'Basic',
    premium: 'Premium',
  }

  const tierPrices: { [key: string]: string } = {
    basic: '$20',
    premium: user?.accessLevel === 'basic' ? '$30' : '$50',
  }

  const getTierFeatures = (tier: string) => {
    if (tier === 'basic') {
      return [
        'Полный доступ к Анатомии',
        'Полный доступ к Гигиене',
        '4 основных протокола массажа',
      ]
    }
    return [
      'Все протоколы массажа',
      'Триггерные точки',
      'Тесты и викторины',
      '3D модели анатомии',
    ]
  }

  return (
    <Box>
      {/* Preview content */}
      {preview && (
        <Box sx={{ mb: 3, position: 'relative' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {preview}
          </Typography>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100px',
              background: 'linear-gradient(to bottom, transparent, white)',
              pointerEvents: 'none',
            }}
          />
        </Box>
      )}

      {/* Access gate card */}
      <Paper
        elevation={4}
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        <LockIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />

        <Typography variant="h4" gutterBottom fontWeight={700}>
          Этот {contentType} доступен в тарифе {tierNames[requiredTier]}
        </Typography>

        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Откройте полный доступ за {tierPrices[requiredTier]}
        </Typography>

        {!isAuthenticated ? (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              color: 'text.primary',
            }}
          >
            Пожалуйста, войдите в аккаунт для просмотра своего уровня доступа
          </Alert>
        ) : (
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
            <Chip
              label={`Ваш тариф: ${user?.accessLevel?.toUpperCase() || 'FREE'}`}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
            />
            <Chip
              label={`Требуется: ${tierNames[requiredTier].toUpperCase()}`}
              icon={<StarIcon />}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', color: 'white' }}
            />
          </Stack>
        )}

        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 2,
            p: 2,
            mb: 3,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Что входит в тариф {tierNames[requiredTier]}:
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {getTierFeatures(requiredTier).map((feature, idx) => (
              <Typography key={idx} variant="body2" sx={{ opacity: 0.9 }}>
                ✓ {feature}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          {!isAuthenticated ? (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: 'white',
                  color: (theme) => theme.palette.primary.main,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Войти
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: (theme) => theme.palette.grey[200], bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Регистрация
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowIcon />}
              onClick={() => navigate('/pricing')}
              sx={{
                bgcolor: 'white',
                color: (theme) => theme.palette.primary.main,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                '&:hover': { bgcolor: 'grey.100', transform: 'scale(1.05)' },
                transition: 'all 0.3s',
              }}
            >
              Перейти к тарифам
            </Button>
          )}
        </Stack>

        <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.7 }}>
          Единоразовая оплата • Без подписки • Пожизненный доступ
        </Typography>
      </Paper>
    </Box>
  )
}

export default AccessGate
