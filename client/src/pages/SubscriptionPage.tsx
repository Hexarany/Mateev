import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import StarIcon from '@mui/icons-material/Star'
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  startTrial,
  createPayPalOrder,
  capturePayPalOrder,
} from '@/services/api'
import type { SubscriptionPlan, CurrentSubscription } from '@/types'

const SubscriptionPage = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const { token, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [trialDays, setTrialDays] = useState(7)
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const plansData = await getSubscriptionPlans()
        setPlans(plansData.plans)
        setTrialDays(plansData.trialDays)

        if (token) {
          const subData = await getCurrentSubscription(token)
          setCurrentSub(subData)
        }
      } catch (err: any) {
        console.error('Error fetching subscription data:', err)
        setError(lang === 'ru' ? 'Ошибка загрузки данных' : 'Eroare la încărcarea datelor')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, lang])

  // Обработка возврата от PayPal
  useEffect(() => {
    const paypalToken = searchParams.get('token')
    const planId = searchParams.get('planId')

    if (paypalToken && planId && token) {
      handlePayPalReturn(paypalToken, planId)
    }
  }, [searchParams, token])

  const handlePayPalReturn = async (orderId: string, planId: string) => {
    if (!token) return

    try {
      setProcessing(true)
      const response = await capturePayPalOrder(token, orderId, planId)

      setSuccess(
        lang === 'ru'
          ? 'Подписка успешно активирована!'
          : 'Abonament activat cu succes!'
      )

      // Обновить данные подписки
      const subData = await getCurrentSubscription(token)
      setCurrentSub(subData)

      // Очистить URL
      navigate('/subscription', { replace: true })
    } catch (err: any) {
      console.error('Error capturing PayPal payment:', err)
      setError(
        lang === 'ru'
          ? 'Ошибка при завершении платежа'
          : 'Eroare la finalizarea plății'
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleStartTrial = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      setProcessing(true)
      await startTrial(token)
      setSuccess(
        lang === 'ru'
          ? `Пробный период на ${trialDays} дней активирован!`
          : `Perioadă de probă de ${trialDays} zile activată!`
      )

      // Обновить данные
      const subData = await getCurrentSubscription(token)
      setCurrentSub(subData)
    } catch (err: any) {
      console.error('Error starting trial:', err)
      setError(err.response?.data?.message || (lang === 'ru' ? 'Ошибка' : 'Eroare'))
    } finally {
      setProcessing(false)
    }
  }

  const handleBuyPlan = async (planId: string) => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      setProcessing(true)
      const response = await createPayPalOrder(token, planId)

      // Перенаправить на PayPal с сохранением planId
      const approvalUrl = response.approvalUrl + `&planId=${planId}`
      window.location.href = approvalUrl
    } catch (err: any) {
      console.error('Error creating PayPal order:', err)
      setError(
        lang === 'ru'
          ? 'Ошибка при создании заказа'
          : 'Eroare la crearea comenzii'
      )
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  const hasActiveSub = currentSub?.user.hasActiveSubscription

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {lang === 'ru' ? 'Выберите план подписки' : 'Alegeți planul de abonament'}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {lang === 'ru'
            ? 'Получите полный доступ к образовательной платформе'
            : 'Obțineți acces complet la platforma educațională'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Текущая подписка */}
      {hasActiveSub && currentSub && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>
            {lang === 'ru' ? 'Ваша подписка активна' : 'Abonamentul dvs. este activ'}
          </Typography>
          <Typography variant="body2">
            {lang === 'ru' ? 'Действительна до: ' : 'Valabil până la: '}
            {new Date(currentSub.user.subscriptionEndDate!).toLocaleDateString()}
          </Typography>
          <Typography variant="body2">
            {lang === 'ru' ? 'Статус: ' : 'Status: '}
            {currentSub.user.subscriptionStatus === 'trial'
              ? lang === 'ru'
                ? 'Пробный период'
                : 'Perioadă de probă'
              : lang === 'ru'
              ? 'Активна'
              : 'Activ'}
          </Typography>
        </Alert>
      )}

      {/* Кнопка пробного периода */}
      {!hasActiveSub && (
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {lang === 'ru'
                    ? `Попробуйте бесплатно ${trialDays} дней!`
                    : `Încercați gratuit ${trialDays} zile!`}
                </Typography>
                <Typography variant="body1">
                  {lang === 'ru'
                    ? 'Полный доступ без оплаты'
                    : 'Acces complet fără plată'}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={handleStartTrial}
                disabled={processing}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                {processing ? (
                  <CircularProgress size={24} />
                ) : lang === 'ru' ? (
                  'Начать пробный период'
                ) : (
                  'Începeți perioada de probă'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Планы подписок */}
      <Grid container spacing={4}>
        {plans.map((plan, index) => {
          const isPopular = plan.id === 'yearly'
          const savings = plan.id === 'yearly' ? 40 : 0

          return (
            <Grid item xs={12} md={6} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  border: isPopular ? 3 : 1,
                  borderColor: isPopular ? 'primary.main' : 'divider',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8,
                  },
                }}
              >
                {isPopular && (
                  <Chip
                    icon={<StarIcon />}
                    label={lang === 'ru' ? 'Популярный' : 'Popular'}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 600,
                    }}
                  />
                )}

                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {plan.name[lang]}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {plan.description[lang]}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h3" component="span" fontWeight={700}>
                      ${plan.price}
                    </Typography>
                    <Typography variant="h6" component="span" color="text.secondary">
                      {plan.id === 'monthly'
                        ? lang === 'ru'
                          ? '/месяц'
                          : '/lună'
                        : lang === 'ru'
                        ? '/год'
                        : '/an'}
                    </Typography>

                    {savings > 0 && (
                      <Chip
                        label={
                          lang === 'ru'
                            ? `Экономия ${savings}%`
                            : `Economie ${savings}%`
                        }
                        color="success"
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <List dense>
                    {plan.features[lang].map((feature, idx) => (
                      <ListItem key={idx} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant={isPopular ? 'contained' : 'outlined'}
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => handleBuyPlan(plan.id)}
                    disabled={processing || hasActiveSub}
                    sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
                  >
                    {processing ? (
                      <CircularProgress size={24} />
                    ) : hasActiveSub ? (
                      lang === 'ru' ? (
                        'У вас есть подписка'
                      ) : (
                        'Aveți abonament'
                      )
                    ) : lang === 'ru' ? (
                      'Купить через PayPal'
                    ) : (
                      'Cumpărați prin PayPal'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {lang === 'ru'
            ? 'Все платежи обрабатываются безопасно через PayPal'
            : 'Toate plățile sunt procesate în siguranță prin PayPal'}
        </Typography>
      </Box>
    </Container>
  )
}

export default SubscriptionPage
