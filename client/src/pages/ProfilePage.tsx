import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import BadgeIcon from '@mui/icons-material/Badge'
import SubscriptionsIcon from '@mui/icons-material/Subscriptions'
import HistoryIcon from '@mui/icons-material/History'
import {
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
} from '@/services/api'
import type { CurrentSubscription, Subscription } from '@/types'

const ProfilePage = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const { user, token, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null)
  const [history, setHistory] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      if (!token) return

      try {
        setLoading(true)
        const [subData, historyData] = await Promise.all([
          getCurrentSubscription(token),
          getSubscriptionHistory(token),
        ])
        setCurrentSub(subData)
        setHistory(historyData.subscriptions)
      } catch (err: any) {
        console.error('Error fetching profile data:', err)
        setError(
          lang === 'ru'
            ? 'Ошибка загрузки данных профиля'
            : 'Eroare la încărcarea datelor profilului'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, isAuthenticated, navigate, lang])

  const handleCancelSubscription = async () => {
    if (!token) return

    if (
      !confirm(
        lang === 'ru'
          ? 'Вы уверены, что хотите отменить подписку?'
          : 'Sunteți sigur că doriți să anulați abonamentul?'
      )
    ) {
      return
    }

    try {
      setProcessing(true)
      await cancelSubscription(token)
      setSuccess(
        lang === 'ru'
          ? 'Подписка успешно отменена'
          : 'Abonament anulat cu succes'
      )

      // Обновить данные
      const subData = await getCurrentSubscription(token)
      setCurrentSub(subData)
    } catch (err: any) {
      console.error('Error cancelling subscription:', err)
      setError(
        lang === 'ru' ? 'Ошибка отмены подписки' : 'Eroare la anularea abonamentului'
      )
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (
    status: string
  ): 'success' | 'error' | 'warning' | 'info' => {
    switch (status) {
      case 'active':
        return 'success'
      case 'trial':
        return 'info'
      case 'expired':
      case 'cancelled':
        return 'error'
      default:
        return 'warning'
    }
  }

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, { ru: string; ro: string }> = {
      active: { ru: 'Активна', ro: 'Activ' },
      trial: { ru: 'Пробный период', ro: 'Perioadă de probă' },
      expired: { ru: 'Истекла', ro: 'Expirat' },
      cancelled: { ru: 'Отменена', ro: 'Anulat' },
      none: { ru: 'Нет подписки', ro: 'Fără abonament' },
    }
    return statusMap[status]?.[lang] || status
  }

  const getRoleText = (role: string): string => {
    const roleMap: Record<string, { ru: string; ro: string }> = {
      student: { ru: 'Студент', ro: 'Student' },
      teacher: { ru: 'Преподаватель', ro: 'Profesor' },
      admin: { ru: 'Администратор', ro: 'Administrator' },
    }
    return roleMap[role]?.[lang] || role
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!user || !currentSub) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          {lang === 'ru'
            ? 'Не удалось загрузить данные профиля'
            : 'Nu s-au putut încărca datele profilului'}
        </Alert>
      </Container>
    )
  }

  const hasActiveSub = currentSub.user.hasActiveSubscription

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        {lang === 'ru' ? 'Мой профиль' : 'Profilul meu'}
      </Typography>

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

      <Grid container spacing={3}>
        {/* Информация о пользователе */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={600}>
                  {lang === 'ru' ? 'Личная информация' : 'Informații personale'}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <List>
                <ListItem sx={{ px: 0 }}>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary={lang === 'ru' ? 'Имя' : 'Nume'}
                    secondary={user.name}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary={lang === 'ru' ? 'Роль' : 'Rol'}
                    secondary={getRoleText(user.role)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Статус подписки */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SubscriptionsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={600}>
                  {lang === 'ru' ? 'Подписка' : 'Abonament'}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {lang === 'ru' ? 'Статус' : 'Status'}
                </Typography>
                <Chip
                  icon={
                    hasActiveSub ? <CheckCircleIcon /> : <CancelIcon />
                  }
                  label={getStatusText(currentSub.user.subscriptionStatus)}
                  color={getStatusColor(currentSub.user.subscriptionStatus)}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {currentSub.user.subscriptionEndDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {lang === 'ru'
                      ? 'Действительна до'
                      : 'Valabil până la'}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(
                      currentSub.user.subscriptionEndDate
                    ).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'ro-RO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Typography>
                </Box>
              )}

              {currentSub.subscription && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {lang === 'ru' ? 'План' : 'Plan'}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {currentSub.subscription.plan === 'monthly'
                      ? lang === 'ru'
                        ? 'Месячный'
                        : 'Lunar'
                      : lang === 'ru'
                      ? 'Годовой'
                      : 'Anual'}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!hasActiveSub && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/subscription')}
                  >
                    {lang === 'ru' ? 'Оформить подписку' : 'Abonează-te'}
                  </Button>
                )}

                {hasActiveSub &&
                  currentSub.subscription &&
                  currentSub.subscription.autoRenew && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleCancelSubscription}
                      disabled={processing}
                    >
                      {processing ? (
                        <CircularProgress size={24} />
                      ) : lang === 'ru' ? (
                        'Отменить подписку'
                      ) : (
                        'Anulează abonamentul'
                      )}
                    </Button>
                  )}

                {hasActiveSub && (
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/subscription')}
                  >
                    {lang === 'ru'
                      ? 'Управление подпиской'
                      : 'Gestionează abonamentul'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* История подписок */}
        {history.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" fontWeight={600}>
                    {lang === 'ru' ? 'История подписок' : 'Istoric abonamente'}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ overflowX: 'auto' }}>
                  {history.map((sub) => (
                    <Paper
                      key={sub._id}
                      variant="outlined"
                      sx={{ p: 2, mb: 2, '&:last-child': { mb: 0 } }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            {lang === 'ru' ? 'План' : 'Plan'}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {sub.plan === 'monthly'
                              ? lang === 'ru'
                                ? 'Месячный'
                                : 'Lunar'
                              : lang === 'ru'
                              ? 'Годовой'
                              : 'Anual'}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            {lang === 'ru' ? 'Период' : 'Perioadă'}
                          </Typography>
                          <Typography variant="body1">
                            {new Date(sub.startDate).toLocaleDateString()} -{' '}
                            {new Date(sub.endDate).toLocaleDateString()}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                          <Typography variant="body2" color="text.secondary">
                            {lang === 'ru' ? 'Сумма' : 'Sumă'}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            ${sub.amount}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                          <Typography variant="body2" color="text.secondary">
                            {lang === 'ru' ? 'Статус' : 'Status'}
                          </Typography>
                          <Chip
                            label={getStatusText(sub.status)}
                            color={getStatusColor(sub.status)}
                            size="small"
                          />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                          <Typography variant="body2" color="text.secondary">
                            {lang === 'ru' ? 'Автопродление' : 'Reînnoire auto'}
                          </Typography>
                          <Typography variant="body1">
                            {sub.autoRenew
                              ? lang === 'ru'
                                ? 'Да'
                                : 'Da'
                              : lang === 'ru'
                              ? 'Нет'
                              : 'Nu'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  )
}

export default ProfilePage
