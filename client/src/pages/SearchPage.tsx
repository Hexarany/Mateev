import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import ArticleIcon from '@mui/icons-material/Article'
import SpaIcon from '@mui/icons-material/Spa'
import AdjustIcon from '@mui/icons-material/Adjust'
import CleanHandsIcon from '@mui/icons-material/CleanHands'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import QuizIcon from '@mui/icons-material/Quiz'
import OptimizedImage from '@/components/OptimizedImage'
import { globalSearch, saveSearchQuery, type SearchResult } from '@/services/api'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

const typeIcons = {
  topic: ArticleIcon,
  protocol: SpaIcon,
  trigger_point: AdjustIcon,
  hygiene: CleanHandsIcon,
  model_3d: ViewInArIcon,
  quiz: QuizIcon,
}

const typeColors = {
  topic: '#2196f3',
  protocol: '#4caf50',
  trigger_point: '#ff9800',
  hygiene: '#9c27b0',
  model_3d: '#f44336',
  quiz: '#00bcd4',
}

const SearchPage = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedType, setSelectedType] = useState<string>('all')

  const typeLabels = {
    all: lang === 'ru' ? 'Все' : 'Toate',
    topic: lang === 'ru' ? 'Анатомия' : 'Anatomie',
    protocol: lang === 'ru' ? 'Протоколы' : 'Protocoale',
    trigger_point: lang === 'ru' ? 'Триггеры' : 'Puncte Trigger',
    hygiene: lang === 'ru' ? 'Гигиена' : 'Igienă',
    model_3d: lang === 'ru' ? '3D Модели' : 'Modele 3D',
    quiz: lang === 'ru' ? 'Тесты' : 'Teste',
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q, selectedType)
    }
  }, [searchParams])

  const performSearch = async (searchQuery: string, type: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([])
      setTotalResults(0)
      return
    }

    try {
      setLoading(true)
      const typeParam = type === 'all' ? undefined : type
      const data = await globalSearch(searchQuery.trim(), typeParam, lang)
      setResults(data.results)
      setTotalResults(data.total)

      // Сохраняем запрос в историю
      await saveSearchQuery(searchQuery.trim()).catch(() => {
        // Игнорируем ошибки сохранения истории
      })
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 2) {
      setSearchParams({ q: query.trim() })
      performSearch(query, selectedType)
    }
  }

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: string | null) => {
    if (newType !== null) {
      setSelectedType(newType)
      if (query.trim().length >= 2) {
        performSearch(query, newType)
      }
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setTotalResults(0)
    setSearchParams({})
  }

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'topic':
        return `/topic/${result.id}`
      case 'protocol':
        return `/massage-protocols/${result.slug || result.id}`
      case 'trigger_point':
        return `/trigger-points/${result.slug || result.id}`
      case 'hygiene':
        return `/hygiene-guidelines`
      case 'model_3d':
        return `/anatomy-models-3d/${result.slug || result.id}`
      case 'quiz':
        return `/quiz/${result.id}`
      default:
        return '/'
    }
  }

  const renderResultCard = (result: SearchResult) => {
    const Icon = typeIcons[result.type]
    const color = typeColors[result.type]

    return (
      <Grid item xs={12} sm={6} md={4} key={`${result.type}-${result.id}`}>
        <Card
          component={RouterLink}
          to={getResultLink(result)}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          {result.thumbnail && (
            <OptimizedImage
              src={result.thumbnail.startsWith('http') ? result.thumbnail : `${API_BASE_URL}${result.thumbnail}`}
              alt={result.title[lang]}
              height={140}
              objectFit="cover"
            />
          )}
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Icon sx={{ fontSize: 20, color }} />
              <Chip label={typeLabels[result.type]} size="small" sx={{ bgcolor: `${color}20`, color }} />
            </Box>
            <Typography variant="h6" gutterBottom>
              {result.title[lang]}
            </Typography>
            {result.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {result.description[lang].substring(0, 100)}
                {result.description[lang].length > 100 ? '...' : ''}
              </Typography>
            )}
            {result.category && (
              <Typography variant="caption" color="text.secondary">
                {result.category}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {lang === 'ru' ? 'Поиск' : 'Căutare'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {lang === 'ru'
            ? 'Найдите темы анатомии, протоколы массажа, триггерные точки и многое другое'
            : 'Găsiți teme de anatomie, protocoale de masaj, puncte trigger și multe altele'}
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'ru' ? 'Введите запрос для поиска...' : 'Introduceți termenul de căutare...'}
            variant="outlined"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClear} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Paper>

      {/* Type Filters */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleTypeChange}
          aria-label="content type"
          sx={{ flexWrap: 'wrap' }}
        >
          {Object.entries(typeLabels).map(([type, label]) => {
            const Icon = type === 'all' ? SearchIcon : typeIcons[type as keyof typeof typeIcons]
            return (
              <ToggleButton key={type} value={type} aria-label={label}>
                {Icon && <Icon sx={{ mr: 1, fontSize: 20 }} />}
                {label}
              </ToggleButton>
            )
          })}
        </ToggleButtonGroup>
      </Box>

      {/* Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Results Count */}
          {query.trim().length >= 2 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {lang === 'ru'
                ? `Найдено результатов: ${totalResults}`
                : `Rezultate găsite: ${totalResults}`}
            </Typography>
          )}

          {/* Results Grid */}
          {results.length > 0 ? (
            <Grid container spacing={3}>
              {results.map((result) => renderResultCard(result))}
            </Grid>
          ) : query.trim().length >= 2 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {lang === 'ru' ? 'Ничего не найдено' : 'Niciun rezultat'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lang === 'ru'
                  ? 'Попробуйте изменить запрос или фильтры'
                  : 'Încercați să schimbați interogarea sau filtrele'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {lang === 'ru'
                  ? 'Введите запрос для поиска'
                  : 'Introduceți o interogare pentru a căuta'}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default SearchPage
