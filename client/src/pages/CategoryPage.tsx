import { useMemo, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import SearchIcon from '@mui/icons-material/Search'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { useCategoryById } from '@/hooks/useCategories'
import { useTopicsByCategory } from '@/hooks/useTopics'
import type { Category, Topic } from '@/types'
import { useFavorites } from '@/contexts/FavoritesContext'

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const { isFavorite, toggleFavorite } = useFavorites()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: category, isLoading: categoryLoading, error: categoryError } = useCategoryById(categoryId)
  const { data: topics = [], isLoading: topicsLoading, error: topicsError } = useTopicsByCategory(categoryId)

  const isLoading = categoryLoading || topicsLoading
  const error = categoryError || topicsError

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics

    const query = searchQuery.toLowerCase()
    return topics.filter((topic) => {
      const name = topic.name[lang].toLowerCase()
      const description = topic.description[lang].toLowerCase()
      return name.includes(query) || description.includes(query)
    })
  }, [topics, searchQuery, lang])

  // Group topics by region
  const topicsByRegion = useMemo(() => {
    const grouped: { [key: string]: Topic[] } = {}
    const noRegion: Topic[] = []

    filteredTopics.forEach((topic) => {
      if (topic.region && topic.region[lang]) {
        const regionName = topic.region[lang]
        if (!grouped[regionName]) {
          grouped[regionName] = []
        }
        grouped[regionName].push(topic)
      } else {
        noRegion.push(topic)
      }
    })

    return { grouped, noRegion }
  }, [filteredTopics, lang])

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={30} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    )
  }

  if (error || !category) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Категория не найдена / Categoria nu a fost găsită'}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          {t('nav.home')}
        </Link>
        <Typography color="text.primary">{category.name[lang]}</Typography>
      </Breadcrumbs>

      {/* Category Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {category.name[lang]}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {category.description[lang]}
        </Typography>

        {/* Search Bar */}
        {topics.length > 0 && (
          <TextField
            fullWidth
            placeholder={lang === 'ru' ? 'Поиск по названию или описанию...' : 'Căutare după nume sau descriere...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 2, maxWidth: 600 }}
          />
        )}
      </Box>

      {/* Topics Count */}
      {topics.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {lang === 'ru'
              ? `Найдено: ${filteredTopics.length} из ${topics.length}`
              : `Găsite: ${filteredTopics.length} din ${topics.length}`}
          </Typography>
        </Box>
      )}

      {/* Topics by Region */}
      {topics.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          {lang === 'ru' ? 'Темы скоро появятся...' : 'Subiectele vor apărea în curând...'}
        </Typography>
      ) : filteredTopics.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          {lang === 'ru' ? 'Ничего не найдено. Попробуйте другой запрос.' : 'Nu s-a găsit nimic. Încercați o altă căutare.'}
        </Typography>
      ) : (
        <>
          {/* Grouped by region */}
          {Object.entries(topicsByRegion.grouped).map(([regionName, regionTopics]) => (
            <Box key={regionName} sx={{ mb: 6 }}>
              {/* Region Title */}
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  mb: 3,
                  pb: 1,
                  borderBottom: 2,
                  borderColor: 'primary.main',
                  fontWeight: 700,
                }}
              >
                {regionName}
              </Typography>

              {/* Topics in Region */}
              <Grid container spacing={3}>
                {regionTopics.map((topic) => {
            const hasModel = Boolean(topic.model3D)
            const hasImages = topic.images && topic.images.length > 0
            const hasVideos = topic.videos && topic.videos.length > 0
            const favorited = isFavorite(topic._id)

                  return (
                    <Grid item xs={12} sm={6} md={4} key={topic._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8],
                      borderColor: 'primary.main',
                    },
                    border: '1px solid',
                    borderColor: favorited ? 'error.main' : 'divider',
                  }}
                >
                  {/* Favorite Button */}
                  <Tooltip title={favorited ? (lang === 'ru' ? 'Удалить из избранного' : 'Elimină din favorite') : (lang === 'ru' ? 'Добавить в избранное' : 'Adaugă la favorite')}>
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault()
                        toggleFavorite(topic._id)
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        '&:hover': {
                          bgcolor: 'background.paper',
                          transform: 'scale(1.1)',
                        },
                      }}
                      size="small"
                    >
                      {favorited ? (
                        <FavoriteIcon sx={{ color: 'error.main' }} />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Tooltip>

                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <FitnessCenterIcon
                        sx={{
                          mr: 1,
                          color: 'primary.main',
                          fontSize: 28,
                        }}
                      />
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, pr: 4 }}>
                        {topic.name[lang]}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, lineHeight: 1.6 }}
                    >
                      {topic.description[lang]}
                    </Typography>

                    {/* Content Availability Badges */}
                    {(hasModel || hasImages || hasVideos) && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {hasModel && (
                          <Chip
                            icon={<ViewInArIcon />}
                            label={lang === 'ru' ? '3D' : '3D'}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontSize: '0.7rem', height: 24 }}
                          />
                        )}
                        {hasImages && (
                          <Chip
                            icon={<ImageIcon />}
                            label={lang === 'ru' ? 'Фото' : 'Imagini'}
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{ fontSize: '0.7rem', height: 24 }}
                          />
                        )}
                        {hasVideos && (
                          <Chip
                            icon={<VideoLibraryIcon />}
                            label={lang === 'ru' ? 'Видео' : 'Video'}
                            size="small"
                            variant="outlined"
                            color="error"
                            sx={{ fontSize: '0.7rem', height: 24 }}
                          />
                        )}
                      </Stack>
                    )}
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/topic/${topic._id}`}
                      variant="text"
                      sx={{ fontWeight: 600 }}
                    >
                      {t('home.getStarted')}
                    </Button>
                  </CardActions>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        ))}

        {/* Topics without region */}
        {topicsByRegion.noRegion.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mb: 3,
                pb: 1,
                borderBottom: 2,
                borderColor: 'divider',
                fontWeight: 700,
              }}
            >
              {lang === 'ru' ? 'Прочее' : 'Altele'}
            </Typography>

            <Grid container spacing={3}>
              {topicsByRegion.noRegion.map((topic) => {
                const hasModel = Boolean(topic.model3D)
                const hasImages = topic.images && topic.images.length > 0
                const hasVideos = topic.videos && topic.videos.length > 0
                const favorited = isFavorite(topic._id)

                return (
                  <Grid item xs={12} sm={6} md={4} key={topic._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => theme.shadows[8],
                          borderColor: 'primary.main',
                        },
                        border: '1px solid',
                        borderColor: favorited ? 'error.main' : 'divider',
                      }}
                    >
                      {/* Favorite Button */}
                      <Tooltip title={favorited ? (lang === 'ru' ? 'Удалить из избранного' : 'Elimină din favorite') : (lang === 'ru' ? 'Добавить в избранное' : 'Adaugă la favorite')}>
                        <IconButton
                          onClick={(e) => {
                            e.preventDefault()
                            toggleFavorite(topic._id)
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            '&:hover': {
                              bgcolor: 'background.paper',
                              transform: 'scale(1.1)',
                            },
                          }}
                          size="small"
                        >
                          {favorited ? (
                            <FavoriteIcon sx={{ color: 'error.main' }} />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
                      </Tooltip>

                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <FitnessCenterIcon
                            sx={{
                              mr: 1,
                              color: 'primary.main',
                              fontSize: 28,
                            }}
                          />
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, pr: 4 }}>
                            {topic.name[lang]}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2, lineHeight: 1.6 }}
                        >
                          {topic.description[lang]}
                        </Typography>

                        {/* Content Availability Badges */}
                        {(hasModel || hasImages || hasVideos) && (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {hasModel && (
                              <Chip
                                icon={<ViewInArIcon />}
                                label={lang === 'ru' ? '3D' : '3D'}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: '0.7rem', height: 24 }}
                              />
                            )}
                            {hasImages && (
                              <Chip
                                icon={<ImageIcon />}
                                label={lang === 'ru' ? 'Фото' : 'Imagini'}
                                size="small"
                                variant="outlined"
                                color="success"
                                sx={{ fontSize: '0.7rem', height: 24 }}
                              />
                            )}
                            {hasVideos && (
                              <Chip
                                icon={<VideoLibraryIcon />}
                                label={lang === 'ru' ? 'Видео' : 'Video'}
                                size="small"
                                variant="outlined"
                                color="error"
                                sx={{ fontSize: '0.7rem', height: 24 }}
                              />
                            )}
                          </Stack>
                        )}
                      </CardContent>
                      <CardActions sx={{ pt: 0 }}>
                        <Button
                          size="small"
                          component={RouterLink}
                          to={`/topic/${topic._id}`}
                          variant="text"
                          sx={{ fontWeight: 600 }}
                        >
                          {t('home.getStarted')}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        )}
      </>
      )}
    </Container>
  )
}

export default CategoryPage
