import { useEffect, useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Avatar,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  alpha,
  useTheme,
  Fade,
  Grow,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import View3DIcon from '@mui/icons-material/ViewInAr'
import QuizIcon from '@mui/icons-material/Quiz'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SpaIcon from '@mui/icons-material/Spa'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TelegramIcon from '@mui/icons-material/Telegram'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ChatIcon from '@mui/icons-material/Chat'
import CheckIcon from '@mui/icons-material/Check'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import ForumIcon from '@mui/icons-material/Forum'
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { getCategories } from '@/services/api'
import type { Category } from '@/types'
import { TELEGRAM_BOT_LINK, TELEGRAM_BOT_QR, TELEGRAM_BOT_USERNAME } from '@/config/telegram'

// Memoized CategoryCard component for better performance
interface CategoryCardProps {
  category: Category
  index: number
  colorScheme: { bg: string; border: string }
  lang: 'ru' | 'ro'
  themeMode: 'light' | 'dark'
  getStartedText: string
}

const CategoryCard = memo(({ category, index, colorScheme, lang, themeMode, getStartedText }: CategoryCardProps) => (
  <Grid item xs={12} sm={6} md={4}>
    <Grow in timeout={300 + index * 100}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: colorScheme.bg,
          borderRadius: 3,
          border: `2px solid transparent`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: themeMode === 'dark'
              ? `0 8px 24px ${alpha(colorScheme.border, 0.3)}`
              : '0 8px 24px rgba(0,0,0,0.12)',
            borderColor: colorScheme.border,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Typography
            variant="h5"
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            }}
          >
            {category.name[lang]}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            {category.description[lang]}
          </Typography>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size="medium"
            component={RouterLink}
            to={`/category/${category._id}`}
            endIcon={<ArrowForwardIcon />}
            sx={{
              color: colorScheme.border,
              fontWeight: 600,
              '&:hover': {
                bgcolor: alpha(colorScheme.border, 0.08),
              },
            }}
          >
            {getStartedText}
          </Button>
        </CardActions>
      </Card>
    </Grow>
  </Grid>
))

CategoryCard.displayName = 'CategoryCard'

const HomePage = () => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const { isAuthenticated } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const lang = i18n.language as 'ru' | 'ro'
  const anatomyHighlights = categories.slice(0, 3)

  const heroHighlights = [
    {
      icon: <SpaIcon sx={{ fontSize: 40 }} />,
      title: t('home.hero.modules.practice.title'),
      description: t('home.hero.modules.practice.description'),
      color: theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32',
    },
    {
      icon: <LibraryBooksIcon sx={{ fontSize: 40 }} />,
      title: t('home.hero.modules.anatomy.title'),
      description: t('home.hero.modules.anatomy.description'),
      color: theme.palette.mode === 'dark' ? '#4fc3f7' : '#0277bd',
    },
    {
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      title: t('home.hero.modules.homework.title'),
      description: t('home.hero.modules.homework.description'),
      color: theme.palette.mode === 'dark' ? '#ffb74d' : '#ef6c00',
    },
    {
      icon: <TelegramIcon sx={{ fontSize: 40 }} />,
      title: t('home.hero.modules.telegram.title'),
      description: t('home.hero.modules.telegram.description'),
      color: theme.palette.mode === 'dark' ? '#90caf9' : '#0088cc',
    },
  ]

  const programModules = [
    {
      key: 'foundations',
      icon: <SpaIcon sx={{ fontSize: 36 }} />,
      title: t('home.modules.items.foundations.title'),
      description: t('home.modules.items.foundations.description'),
      path: '/massage-protocols',
      color: theme.palette.mode === 'dark' ? '#f48fb1' : '#c2185b',
    },
    {
      key: 'anatomy',
      icon: <View3DIcon sx={{ fontSize: 36 }} />,
      title: t('home.modules.items.anatomy.title'),
      description: t('home.modules.items.anatomy.description'),
      path: '/categories',
      color: theme.palette.mode === 'dark' ? '#4dd0e1' : '#0288d1',
    },
    {
      key: 'practice',
      icon: <QuizIcon sx={{ fontSize: 36 }} />,
      title: t('home.modules.items.practice.title'),
      description: t('home.modules.items.practice.description'),
      path: '/assignments',
      color: theme.palette.mode === 'dark' ? '#ffd54f' : '#f57c00',
    },
    {
      key: 'support',
      icon: <LocalHospitalIcon sx={{ fontSize: 36 }} />,
      title: t('home.modules.items.support.title'),
      description: t('home.modules.items.support.description'),
      path: '/hygiene-guidelines',
      color: theme.palette.mode === 'dark' ? '#ba68c8' : '#7b1fa2',
    },
  ]

  const learningSteps = t('home.steps.items', { returnObjects: true }) as Array<{ title: string; description: string }>
  const audienceSegments = t('home.audience.items', { returnObjects: true }) as Array<{ title: string; description: string }>
  const stepIcons = [
    <PlayCircleOutlineIcon sx={{ fontSize: 40 }} />,
    <AssignmentTurnedInIcon sx={{ fontSize: 40 }} />,
    <ForumIcon sx={{ fontSize: 40 }} />,
  ]
  const audienceIcons = [
    <SelfImprovementIcon sx={{ fontSize: 40 }} />,
    <SpaIcon sx={{ fontSize: 40 }} />,
    <WorkspacePremiumIcon sx={{ fontSize: 40 }} />,
  ]
  const subscriptionPlans = t('home.subscription.plans', { returnObjects: true }) as Array<{
    name: string
    price: string
    description: string
    features: string[]
    highlighted?: boolean
  }>
  const testimonials = t('home.testimonials.items', { returnObjects: true }) as Array<{
    name: string
    role: string
    quote: string
    progress: string
  }>
  const planColors = [
    theme.palette.mode === 'dark' ? '#757575' : '#9e9e9e',
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? '#ffb74d' : '#f57c00',
  ]
  const avatarColors = [
    theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
    theme.palette.mode === 'dark' ? '#f48fb1' : '#c2185b',
    theme.palette.mode === 'dark' ? '#a5d6a7' : '#388e3c',
  ]

  const getInitials = (name: string) => name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()

  const heroPrimaryCta = isAuthenticated ? t('home.hero.ctaAuthed') : t('home.hero.ctaGuest')
  const heroSecondaryCta = t('home.hero.ctaSecondary')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Theme-aware colors for categories
  const getCategoryColor = (index: number) => {
    const colors = theme.palette.mode === 'dark'
      ? [
          { bg: alpha(theme.palette.primary.main, 0.15), border: theme.palette.primary.main },
          { bg: alpha(theme.palette.secondary.main, 0.15), border: theme.palette.secondary.main },
          { bg: alpha('#ba68c8', 0.15), border: '#ba68c8' },
          { bg: alpha('#81c784', 0.15), border: '#81c784' },
          { bg: alpha('#ffb74d', 0.15), border: '#ffb74d' },
        ]
      : [
          { bg: '#e3f2fd', border: '#1976d2' },
          { bg: '#fce4ec', border: '#c2185b' },
          { bg: '#f3e5f5', border: '#7b1fa2' },
          { bg: '#e8f5e9', border: '#388e3c' },
          { bg: '#fff3e0', border: '#f57c00' },
        ]

    return colors[index % colors.length]
  }

  return (
    <Box>
      {/* Hero Section with Gradient */}
      <Box
        sx={{
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: 'white',
          py: { xs: 8, sm: 10, md: 15 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                fontWeight: 700,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {t('home.hero.title')}
            </Typography>
          </Fade>
          <Fade in timeout={1000}>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.95,
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                fontWeight: 400,
              }}
            >
              {t('home.hero.subtitle')}
            </Typography>
          </Fade>
          <Fade in timeout={1200}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button
                variant="contained"
                size="large"
                color="secondary"
                component={RouterLink}
                to={isAuthenticated ? '/dashboard' : '/register'}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: { xs: 4, md: 5 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.35)',
                  },
                }}
              >
                {heroPrimaryCta}
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/categories"
                sx={{
                  borderColor: 'rgba(255,255,255,0.8)',
                  color: 'white',
                  borderRadius: 2,
                  px: { xs: 4, md: 5 },
                  py: { xs: 1.4, md: 2 },
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                {heroSecondaryCta}
              </Button>
            </Box>
          </Fade>
          <Grid container spacing={2} sx={{ mt: { xs: 5, md: 7 }, alignItems: 'stretch' }}>
            {heroHighlights.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    textAlign: 'left',
                    bgcolor: alpha('#ffffff', 0.1),
                    border: `1px solid ${alpha(item.color, 0.5)}`,
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      bgcolor: alpha(item.color, 0.2),
                      color: item.color,
                      mb: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Program Modules Section */}
      <Container id="programs" maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            mb: { xs: 3, md: 4 },
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
            fontWeight: 700,
          }}
        >
          {t('home.modules.title')}
        </Typography>
        <Grid container spacing={2}>
          {programModules.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
              <Card
                component={RouterLink}
                to={item.path}
                sx={{
                  height: '100%',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  textDecoration: 'none',
                  border: `2px solid transparent`,
                  position: 'relative',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 12px 30px rgba(0,0,0,0.45)'
                      : '0 12px 30px rgba(0,0,0,0.18)',
                    borderColor: item.color,
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: alpha(item.color, 0.1),
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {item.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Subscription Overview */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 700,
          }}
        >
          {t('home.subscription.title')}
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 5, maxWidth: 720, mx: 'auto' }}>
          {t('home.subscription.subtitle')}
        </Typography>
        <Grid container spacing={3} alignItems="stretch">
          {subscriptionPlans.map((plan, index) => (
            <Grid item xs={12} md={4} key={plan.name} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  border: plan.highlighted ? `2px solid ${planColors[index]}` : '1px solid transparent',
                  boxShadow: plan.highlighted
                    ? theme.palette.mode === 'dark'
                      ? '0 14px 32px rgba(0,0,0,0.45)'
                      : '0 14px 32px rgba(0,0,0,0.18)'
                    : theme.palette.mode === 'dark'
                      ? '0 10px 25px rgba(0,0,0,0.35)'
                      : '0 8px 20px rgba(0,0,0,0.12)',
                  position: 'relative',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 16px 36px rgba(0,0,0,0.5)'
                      : '0 16px 36px rgba(0,0,0,0.2)',
                  },
                }}
              >
                {plan.highlighted && (
                  <Chip
                    label={t('home.subscription.popular')}
                    color="secondary"
                    size="small"
                    sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 600 }}
                  />
                )}
                <Typography variant="h6" fontWeight={700}>
                  {plan.name}
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="h3" component="span" sx={{ color: planColors[index], fontWeight: 700 }}>
                    ${plan.price}
                  </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {plan.description}
                </Typography>
                <List dense sx={{ textAlign: 'left', mb: 3 }}>
                  {plan.features.map((feature) => (
                    <ListItem key={feature} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 'auto' }}>
                  <Button
                    component={RouterLink}
                    to="/pricing"
                    variant={plan.highlighted ? 'contained' : 'outlined'}
                    size="medium"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    {i18n.language === 'ru' ? 'Смотреть тарифы' : 'Vezi planurile'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Statistics Section */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.dark, 0.2)
            : alpha(theme.palette.primary.light, 0.1),
          py: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              {
                icon: <SchoolIcon sx={{ fontSize: 50 }} />,
                value: '100+',
                label: i18n.language === 'ru' ? 'Уроков и тем' : 'Lecții și subiecte',
                color: theme.palette.primary.main,
              },
              {
                icon: <QuizIcon sx={{ fontSize: 50 }} />,
                value: '50+',
                label: i18n.language === 'ru' ? 'Тестов и викторин' : 'Teste și chestionare',
                color: theme.palette.secondary.main,
              },
              {
                icon: <PeopleIcon sx={{ fontSize: 50 }} />,
                value: '500+',
                label: i18n.language === 'ru' ? 'Студентов' : 'Studenți',
                color: theme.palette.mode === 'dark' ? '#81c784' : '#388e3c',
              },
              {
                icon: <EmojiEventsIcon sx={{ fontSize: 50 }} />,
                value: '300+',
                label: i18n.language === 'ru' ? 'Сертификатов выдано' : 'Certificate eliberate',
                color: theme.palette.mode === 'dark' ? '#ffb74d' : '#f57c00',
              },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      color: stat.color,
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Anatomy Module Highlights */}
      <Box
        id="anatomy"
        sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.4)
            : 'background.default',
          py: { xs: 6, sm: 8, md: 10 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
            }}
          >
            {t('home.anatomyModule.title')}
          </Typography>
          <Typography align="center" color="text.secondary" sx={{ mb: 5, maxWidth: 720, mx: 'auto' }}>
            {t('home.anatomyModule.description')}
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <Grid container spacing={3} alignItems="stretch">
              {anatomyHighlights.map((category, index) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  index={index}
                  colorScheme={getCategoryColor(index)}
                  lang={lang}
                  themeMode={theme.palette.mode}
                  getStartedText={t('home.getStarted')}
                />
              ))}
            </Grid>
          )}
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/categories"
              sx={{ px: 4, py: 1.4, borderRadius: 2, fontWeight: 600 }}
            >
              {t('home.anatomyModule.cta')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Learning Journey */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8, md: 10 } }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            mb: { xs: 3, md: 5 },
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 700,
          }}
        >
          {t('home.steps.title')}
        </Typography>
        <Grid container spacing={3}>
          {learningSteps.map((step, index) => (
            <Grid item xs={12} md={4} key={step.title}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 10px 25px rgba(0,0,0,0.4)'
                    : '0 10px 30px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Chip
                    label={`0${index + 1}`}
                    color="primary"
                    sx={{ fontWeight: 600, fontSize: '1rem', px: 1 }}
                  />
                  <Box sx={{ color: 'primary.main' }}>
                    {stepIcons[index]}
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {step.title}
                </Typography>
                <Typography color="text.secondary">
                  {step.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Audience Section */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.dark, 0.25)
            : alpha(theme.palette.primary.light, 0.15),
          py: { xs: 6, sm: 8, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              mb: { xs: 3, md: 5 },
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
            }}
          >
            {t('home.audience.title')}
          </Typography>
          <Grid container spacing={3}>
            {audienceSegments.map((segment, index) => (
              <Grid item xs={12} md={4} key={segment.title}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 2,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 10px 25px rgba(0,0,0,0.35)'
                      : '0 10px 25px rgba(0,0,0,0.12)',
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                    }}
                  >
                    {audienceIcons[index]}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {segment.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {segment.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8, md: 10 } }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            mb: { xs: 3, md: 5 },
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 700,
          }}
        >
          {t('home.testimonials.title')}
        </Typography>
        <Grid container spacing={3} alignItems="stretch">
          {testimonials.map((item, index) => (
            <Grid item xs={12} md={4} key={item.name} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 12px 28px rgba(0,0,0,0.4)'
                    : '0 12px 28px rgba(0,0,0,0.12)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: avatarColors[index % avatarColors.length] }}>
                    {getInitials(item.name)}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.role}
                    </Typography>
                  </Box>
                  <Chip
                    label={item.progress}
                    size="small"
                    color="primary"
                    sx={{ ml: 'auto', fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body1" color="text.secondary">
                  “{item.quote}”
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Telegram Bot Promotion Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8, md: 10 } }}>
        <Card
          sx={{
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, #0088cc 0%, #0066aa 100%)`
              : `linear-gradient(135deg, #0088cc 0%, #54a9eb 100%)`,
            color: 'white',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TelegramIcon sx={{ fontSize: 50, mr: 2 }} />
                  <Typography variant="h4" component="h2" fontWeight={700}>
                    {i18n.language === 'ru' ? 'Учитесь в Telegram!' : 'Învățați în Telegram!'}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.95, fontWeight: 400 }}>
                  {i18n.language === 'ru'
                    ? 'Получите полный доступ к платформе прямо в Telegram'
                    : 'Obțineți acces complet la platformă direct în Telegram'}
                </Typography>
                <Grid container spacing={2}>
                  {[
                    {
                      icon: <NotificationsActiveIcon />,
                      text: i18n.language === 'ru'
                        ? 'Уведомления о новых уроках и заданиях'
                        : 'Notificări despre lecții și teme noi',
                    },
                    {
                      icon: <ChatIcon />,
                      text: i18n.language === 'ru'
                        ? 'Быстрый доступ к материалам'
                        : 'Acces rapid la materiale',
                    },
                    {
                      icon: <QuizIcon />,
                      text: i18n.language === 'ru'
                        ? 'Ежедневные викторины и тесты'
                        : 'Chestionare și teste zilnice',
                    },
                  ].map((feature, index) => (
                    <Grid item xs={12} sm={6} md={12} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            p: 1,
                            display: 'flex',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {feature.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    textAlign: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    p: 4,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    {i18n.language === 'ru' ? 'Начните сейчас!' : 'Începeți acum!'}
                  </Typography>

                  {/* QR Code */}
                  <Box
                    sx={{
                      display: 'inline-block',
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 2,
                      mb: 3,
                    }}
                  >
                    <img
                      src={TELEGRAM_BOT_QR}
                      alt="QR Code for Telegram Bot"
                      style={{ display: 'block', width: 180, height: 180 }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                    {i18n.language === 'ru'
                      ? 'Отсканируйте QR-код или нажмите кнопку ниже'
                      : 'Scanați codul QR sau apăsați butonul de mai jos'}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    href={TELEGRAM_BOT_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<TelegramIcon />}
                    sx={{
                      bgcolor: 'white',
                      color: '#0088cc',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    {i18n.language === 'ru' ? 'Открыть в Telegram' : 'Deschide în Telegram'}
                  </Button>
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.8 }}>
                    @{TELEGRAM_BOT_USERNAME}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default HomePage
