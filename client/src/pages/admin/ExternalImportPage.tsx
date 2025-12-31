import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from '@mui/material'
import {
  CloudDownload as ImportIcon,
  Image as ImageIcon,
  Article as ArticleIcon,
  Science as ScienceIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ExternalImportPage() {
  const [tab, setTab] = useState(0)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ImportIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" gutterBottom>
            Импорт из внешних источников
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Импортируйте контент из Wikipedia, Wikimedia Commons, PubMed и других источников
          </Typography>
        </Box>
      </Box>

      <Card>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<ArticleIcon />} label="Wikipedia" />
          <Tab icon={<ImageIcon />} label="Изображения" />
          <Tab icon={<ScienceIcon />} label="PubMed" />
          <Tab icon={<TranslateIcon />} label="Перевод" />
        </Tabs>

        <CardContent>
          <TabPanel value={tab} index={0}>
            <WikipediaImport />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <WikimediaImagesSearch />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <PubMedSearch />
          </TabPanel>

          <TabPanel value={tab} index={3}>
            <TextTranslator />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  )
}

/**
 * Wikipedia Import - Full topic import from Wikipedia
 */
function WikipediaImport() {
  const [term, setTerm] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [includeImages, setIncludeImages] = useState(true)
  const [translateToRomanian, setTranslateToRomanian] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories')
      return response.data
    },
  })

  const handleImport = async () => {
    if (!term || !categoryId) {
      setError('Введите термин и выберите категорию')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await api.post('/external-import/topic', {
        term,
        categoryId,
        includeImages,
        translateToRomanian,
      })

      setResult(response.data)
      setTerm('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка импорта')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Импорт темы из Wikipedia
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Автоматически создает тему с контентом, переводом и изображениями из Wikipedia
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Термин для поиска"
            placeholder="Например: Анатомия человека"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Категория"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories?.map((category: any) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name.ru}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Checkbox checked={includeImages} onChange={(e) => setIncludeImages(e.target.checked)} />}
            label="Скачать изображения (до 5 шт.)"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Checkbox checked={translateToRomanian} onChange={(e) => setTranslateToRomanian(e.target.checked)} />}
            label="Перевести на румынский (Claude AI)"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            size="large"
            onClick={handleImport}
            disabled={loading || !term || !categoryId}
            startIcon={loading ? <CircularProgress size={20} /> : <ImportIcon />}
          >
            {loading ? 'Импортирую...' : 'Импортировать тему'}
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Тема успешно импортирована!
          </Typography>
          <Typography variant="body2">
            Название: {result.topic.name.ru}
          </Typography>
          <Typography variant="body2">
            Изображений: {result.images.length}
          </Typography>
          {result.sources.ru && (
            <Typography variant="body2">
              Источник: <a href={result.sources.ru} target="_blank" rel="noopener noreferrer">{result.sources.ru}</a>
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  )
}

/**
 * Wikimedia Commons Image Search
 */
function WikimediaImagesSearch() {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<any[]>([])
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<any>(null)

  const handleSearch = async () => {
    if (!query) return

    setLoading(true)
    setError('')

    try {
      const response = await api.get('/external-import/images', {
        params: { query, limit },
      })

      setImages(response.data.images)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка поиска')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Поиск изображений на Wikimedia Commons
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ищите бесплатные медицинские изображения с открытыми лицензиями
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Поисковый запрос"
            placeholder="Например: heart anatomy"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            type="number"
            label="Лимит"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            inputProps={{ min: 1, max: 50 }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !query}
            startIcon={loading ? <CircularProgress size={20} /> : <ImageIcon />}
            sx={{ height: '100%' }}
          >
            Поиск
          </Button>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
                }}
                onClick={() => setSelectedImage(image)}
              >
                <Box
                  component="img"
                  src={image.thumbUrl}
                  alt={image.title}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
                <CardContent>
                  <Typography variant="body2" noWrap>
                    {image.title}
                  </Typography>
                  <Chip label={image.license} size="small" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Image Details Dialog */}
      <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="md" fullWidth>
        {selectedImage && (
          <>
            <DialogTitle>{selectedImage.title}</DialogTitle>
            <DialogContent>
              <Box
                component="img"
                src={selectedImage.url}
                alt={selectedImage.title}
                sx={{ width: '100%', mb: 2 }}
              />
              <Typography variant="body2" gutterBottom>
                <strong>Автор:</strong> <span dangerouslySetInnerHTML={{ __html: selectedImage.author }} />
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Лицензия:</strong> {selectedImage.license}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Размер:</strong> {selectedImage.width} × {selectedImage.height}px
              </Typography>
              {selectedImage.description && (
                <Typography variant="body2" gutterBottom>
                  <strong>Описание:</strong> <span dangerouslySetInnerHTML={{ __html: selectedImage.description }} />
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => window.open(selectedImage.pageUrl, '_blank')}>
                Открыть на Wikimedia
              </Button>
              <Button onClick={() => setSelectedImage(null)}>Закрыть</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

/**
 * PubMed Literature Search
 */
function PubMedSearch() {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(5)
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState<any[]>([])
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query) return

    setLoading(true)
    setError('')

    try {
      const response = await api.get('/external-import/medical-literature', {
        params: { query, limit },
      })

      setArticles(response.data.articles)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка поиска')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Поиск медицинской литературы в PubMed
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ищите научные статьи и исследования в базе данных PubMed/NLM
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={9}>
          <TextField
            fullWidth
            label="Поисковый запрос"
            placeholder="Например: massage therapy benefits"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>

        <Grid item xs={12} md={1}>
          <TextField
            fullWidth
            type="number"
            label="Лимит"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            inputProps={{ min: 1, max: 20 }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !query}
            startIcon={loading ? <CircularProgress size={20} /> : <ScienceIcon />}
            sx={{ height: '100%' }}
          >
            Поиск
          </Button>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {articles.length > 0 && (
        <List>
          {articles.map((article) => (
            <ListItem key={article.pmid} disablePadding>
              <ListItemButton
                onClick={() => window.open(article.url, '_blank')}
                sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <ListItemText
                  primary={article.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {article.authors}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {article.source} • {article.pubdate}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}

/**
 * Text Translator using Claude
 */
function TextTranslator() {
  const [text, setText] = useState('')
  const [fromLanguage, setFromLanguage] = useState('en')
  const [toLanguage, setToLanguage] = useState('ru')
  const [loading, setLoading] = useState(false)
  const [translated, setTranslated] = useState('')
  const [error, setError] = useState('')

  const handleTranslate = async () => {
    if (!text) return

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/external-import/translate', {
        text,
        fromLanguage,
        toLanguage,
      })

      setTranslated(response.data.translated)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка перевода')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Медицинский переводчик (Claude AI)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Переводите медицинский контент с сохранением терминологии и точности
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="С языка"
            value={fromLanguage}
            onChange={(e) => setFromLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ru">Русский</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="На язык"
            value={toLanguage}
            onChange={(e) => setToLanguage(e.target.value)}
          >
            <MenuItem value="ru">Русский</MenuItem>
            <MenuItem value="ro">Română</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Текст для перевода"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вставьте медицинский текст для перевода..."
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleTranslate}
            disabled={loading || !text}
            startIcon={loading ? <CircularProgress size={20} /> : <TranslateIcon />}
          >
            {loading ? 'Перевожу...' : 'Перевести'}
          </Button>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {translated && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Перевод:
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {translated}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  )
}
