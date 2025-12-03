import { useEffect, useState } from 'react'
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
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import ArticleIcon from '@mui/icons-material/Article'
import LinkIcon from '@mui/icons-material/Link'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import BookmarkButton from '@/components/BookmarkButton'
import AccessGate from '@/components/AccessGate'
import { getResources, getResourceCategories, incrementResourceDownloads, type Resource } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

const typeIcons = {
  pdf: PictureAsPdfIcon,
  doc: DescriptionIcon,
  book: MenuBookIcon,
  article: ArticleIcon,
  link: LinkIcon,
  video: VideoLibraryIcon,
}

const typeColors = {
  pdf: '#f44336',
  doc: '#2196f3',
  book: '#4caf50',
  article: '#ff9800',
  link: '#9c27b0',
  video: '#e91e63',
}

const ResourcesLibraryPage = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const { hasAccess } = useAuth()

  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [selectedCategory, selectedType])

  const loadData = async () => {
    try {
      setLoading(true)
      const [resourcesData, categoriesData] = await Promise.all([
        getResources({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          type: selectedType === 'all' ? undefined : selectedType,
          search: search || undefined,
        }),
        getResourceCategories(),
      ])
      setResources(resourcesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadData()
  }

  const handleDownload = async (resource: Resource) => {
    try {
      await incrementResourceDownloads(resource._id)
      if (resource.fileUrl) {
        window.open(resource.fileUrl, '_blank')
      } else if (resource.externalUrl) {
        window.open(resource.externalUrl, '_blank')
      }
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getAccessLabel = (level: string) => {
    if (level === 'free') return lang === 'ru' ? 'Бесплатно' : 'Gratuit'
    if (level === 'basic') return 'Basic'
    return 'Premium'
  }

  const canAccess = (level: string) => {
    if (level === 'free') return true
    if (level === 'basic') return hasAccess('basic')
    return hasAccess('premium')
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {lang === 'ru' ? 'Библиотека материалов' : 'Biblioteca de materiale'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {lang === 'ru'
            ? 'Учебные материалы, книги, статьи и полезные ресурсы для изучения массажа'
            : 'Materiale educaționale, cărți, articole și resurse utile pentru studiul masajului'}
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder={lang === 'ru' ? 'Поиск материалов...' : 'Căutare materiale...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{lang === 'ru' ? 'Категория' : 'Categorie'}</InputLabel>
          <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label={lang === 'ru' ? 'Категория' : 'Categorie'}>
            <MenuItem value="all">{lang === 'ru' ? 'Все категории' : 'Toate categoriile'}</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{lang === 'ru' ? 'Тип' : 'Tip'}</InputLabel>
          <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} label={lang === 'ru' ? 'Тип' : 'Tip'}>
            <MenuItem value="all">{lang === 'ru' ? 'Все типы' : 'Toate tipurile'}</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="doc">{lang === 'ru' ? 'Документы' : 'Documente'}</MenuItem>
            <MenuItem value="book">{lang === 'ru' ? 'Книги' : 'Cărți'}</MenuItem>
            <MenuItem value="article">{lang === 'ru' ? 'Статьи' : 'Articole'}</MenuItem>
            <MenuItem value="link">{lang === 'ru' ? 'Ссылки' : 'Linkuri'}</MenuItem>
            <MenuItem value="video">{lang === 'ru' ? 'Видео' : 'Video'}</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleSearch}>
          {lang === 'ru' ? 'Найти' : 'Caută'}
        </Button>
      </Box>

      {/* Resources Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {resources.map((resource) => {
            const Icon = typeIcons[resource.type]
            const color = typeColors[resource.type]
            const hasAccessToResource = canAccess(resource.accessLevel)

            return (
              <Grid item xs={12} sm={6} md={4} key={resource._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 2, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon sx={{ color, fontSize: 32 }} />
                      <Chip label={getAccessLabel(resource.accessLevel)} size="small" color={resource.accessLevel === 'free' ? 'success' : resource.accessLevel === 'basic' ? 'info' : 'warning'} />
                    </Box>
                    <BookmarkButton contentType="book" contentId={resource._id} size="small" />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {resource.title[lang]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {resource.description[lang].substring(0, 120)}
                      {resource.description[lang].length > 120 ? '...' : ''}
                    </Typography>

                    {resource.author && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {lang === 'ru' ? 'Автор:' : 'Autor:'} {resource.author}
                      </Typography>
                    )}

                    {resource.fileSize && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {lang === 'ru' ? 'Размер:' : 'Dimensiune:'} {formatFileSize(resource.fileSize)}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary" display="block">
                      {lang === 'ru' ? 'Загрузок:' : 'Descărcări:'} {resource.downloads}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    {hasAccessToResource ? (
                      <>
                        <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(resource)}>
                          {resource.type === 'link' ? (lang === 'ru' ? 'Открыть' : 'Deschide') : lang === 'ru' ? 'Скачать' : 'Descarcă'}
                        </Button>
                        <IconButton size="small" onClick={() => handleDownload(resource)}>
                          <VisibilityIcon />
                        </IconButton>
                      </>
                    ) : (
                      <Button size="small" disabled>
                        {lang === 'ru' ? 'Требуется' : 'Necesită'} {resource.accessLevel === 'basic' ? 'Basic' : 'Premium'}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {!loading && resources.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {lang === 'ru' ? 'Материалы не найдены' : 'Nu s-au găsit materiale'}
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default ResourcesLibraryPage
