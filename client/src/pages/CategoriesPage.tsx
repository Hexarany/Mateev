import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Skeleton,
  Alert,
  alpha,
  useTheme,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SchoolIcon from '@mui/icons-material/School'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/contexts/AuthContext'
import type { Category } from '@/types'

const CategoriesPage = () => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const { data: categories = [], isLoading, error } = useCategories()
  const { user } = useAuth()

  const lang = i18n.language as 'ru' | 'ro'
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin'

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
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 700,
            mb: 2,
          }}
        >
          {i18n.language === 'ru' ? 'Категории' : 'Categorii'}
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
        >
          {i18n.language === 'ru'
            ? 'Изучайте анатомию по категориям - от мышц до нервной системы'
            : 'Studiați anatomia pe categorii - de la mușchi la sistemul nervos'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Ошибка при загрузке категорий'}
        </Alert>
      )}

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={36} width="40%" />
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : categories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            {i18n.language === 'ru'
              ? 'Категории пока не добавлены'
              : 'Categoriile nu au fost adăugate încă'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category, index) => {
            const colorScheme = getCategoryColor(index)
            return (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
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
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 24px ${alpha(colorScheme.border, 0.3)}`
                        : '0 8px 24px rgba(0,0,0,0.12)',
                      borderColor: colorScheme.border,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.mode === 'dark'
                            ? theme.palette.text.primary
                            : 'text.primary',
                        }}
                      >
                        {category.name[lang]}
                      </Typography>
                      {category.teacherOnly && isTeacherOrAdmin && (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: alpha(theme.palette.info.main, 0.15),
                            color: theme.palette.info.main,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 16 }} />
                          {lang === 'ru' ? 'Для преподавателей' : 'Pentru profesori'}
                        </Box>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
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
                      {i18n.language === 'ru' ? 'Изучить' : 'Studiază'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Container>
  )
}

export default CategoriesPage
