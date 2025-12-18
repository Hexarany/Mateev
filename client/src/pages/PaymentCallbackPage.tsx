import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

const PaymentCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token, updateUser } = useAuth()

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState('')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    const processPayment = async () => {
      const orderId = searchParams.get('token') // PayPal returns 'token' param
      const tierId = searchParams.get('tierId')

      if (!orderId) {
        setStatus('error')
        setError('Order ID отсутствует в URL')
        return
      }

      if (!tierId) {
        setStatus('error')
        setError('Tier ID отсутствует в URL')
        return
      }

      try {
        // Get promo code ID from session storage if exists
        const promoCodeId = sessionStorage.getItem('promoCodeId')

        // Capture the payment
        const response = await axios.post(
          `${API_URL}/tier-payment/capture-order`,
          {
            orderId,
            tierId,
            promoCodeId: promoCodeId || undefined,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        // Clear promo code from session storage
        sessionStorage.removeItem('promoCodeId')

        setPaymentDetails(response.data.paymentDetails)
        updateUser(response.data.user)
        setStatus('success')
      } catch (err: any) {
        console.error('Payment capture error:', err)
        setStatus('error')
        setError(err.response?.data?.message || 'Ошибка при обработке платежа')
      }
    }

    // Check if user cancelled the payment
    const cancelled = searchParams.get('cancelled')
    if (cancelled === 'true') {
      setStatus('error')
      setError('Платеж был отменен')
      return
    }

    processPayment()
  }, [searchParams, token])

  if (status === 'processing') {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={64} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Обработка платежа...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Пожалуйста, подождите. Не закрывайте эту страницу.
          </Typography>
        </Box>
      </Container>
    )
  }

  if (status === 'error') {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Ошибка платежа
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {error}
            </Alert>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ваша карта не была списана. Пожалуйста, попробуйте снова или свяжитесь с
              поддержкой.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
              >
                На главную
              </Button>
              <Button variant="contained" onClick={() => navigate('/pricing')}>
                Попробовать снова
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    )
  }

  // Success
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <SuccessIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Оплата успешна!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Спасибо за покупку
          </Typography>

          <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
            Ваш доступ был успешно обновлен. Теперь вы можете пользоваться всеми
            преимуществами вашего тарифного плана.
          </Alert>

          {paymentDetails && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Детали платежа:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Order ID"
                    secondary={paymentDetails.orderId}
                    secondaryTypographyProps={{ sx: { wordBreak: 'break-all' } }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Сумма"
                    secondary={`${paymentDetails.amount} ${paymentDetails.currency}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Статус"
                    secondary={paymentDetails.status}
                  />
                </ListItem>
              </List>
            </Paper>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Квитанция отправлена на вашу почту. Вы можете начать использовать платформу прямо
            сейчас!
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              На главную
            </Button>
            <Button variant="contained" onClick={() => navigate('/anatomy')}>
              Начать обучение
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default PaymentCallbackPage
