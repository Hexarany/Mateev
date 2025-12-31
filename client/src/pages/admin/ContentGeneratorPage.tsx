import { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import TopicIcon from '@mui/icons-material/Topic'
import QuizIcon from '@mui/icons-material/Quiz'
import SpaIcon from '@mui/icons-material/Spa'
import SchoolIcon from '@mui/icons-material/School'
import api from '@/services/api'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>
}

export default function ContentGeneratorPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'

  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [preview, setPreview] = useState<any>(null)

  // Fetch categories for dropdowns
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories')
      return response.data
    },
  })

  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await api.get('/topics')
      return response.data
    },
  })

  // Topic generation state
  const [topicData, setTopicData] = useState({
    categoryId: '',
    titleRu: '',
    titleRo: '',
    difficulty: 'intermediate',
  })

  // Quiz generation state
  const [quizData, setQuizData] = useState({
    topicId: '',
    questionCount: 10,
    difficulty: 'medium',
  })

  // Protocol generation state
  const [protocolData, setProtocolData] = useState({
    titleRu: '',
    titleRo: '',
    targetArea: '',
    duration: 30,
  })

  // Course generation state
  const [courseData, setCourseData] = useState({
    courseName: '',
    moduleCount: 5,
    generateContent: false,
  })

  const handleGenerateTopic = async () => {
    try {
      setLoading(true)
      setMessage(null)
      setPreview(null)

      const response = await api.post('/content-generator/topic', {
        categoryId: topicData.categoryId,
        topicTitle: { ru: topicData.titleRu, ro: topicData.titleRo },
        difficulty: topicData.difficulty,
      })

      setMessage({
        type: 'success',
        text: lang === 'ru' ? 'Тема успешно сгенерирована!' : 'Tema generată cu succes!',
      })
      setPreview(response.data.topic)

      // Reset form
      setTopicData({ categoryId: '', titleRu: '', titleRo: '', difficulty: 'intermediate' })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Generation failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true)
      setMessage(null)
      setPreview(null)

      const response = await api.post('/content-generator/quiz', quizData)

      setMessage({
        type: 'success',
        text: lang === 'ru'
          ? `Тест с ${quizData.questionCount} вопросами успешно сгенерирован!`
          : `Test cu ${quizData.questionCount} întrebări generat cu succes!`,
      })
      setPreview(response.data.quiz)

      // Reset form
      setQuizData({ topicId: '', questionCount: 10, difficulty: 'medium' })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Generation failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateProtocol = async () => {
    try {
      setLoading(true)
      setMessage(null)
      setPreview(null)

      const response = await api.post('/content-generator/protocol', {
        protocolTitle: { ru: protocolData.titleRu, ro: protocolData.titleRo },
        targetArea: protocolData.targetArea,
        duration: protocolData.duration,
      })

      setMessage({
        type: 'success',
        text: lang === 'ru' ? 'Протокол успешно сгенерирован!' : 'Protocol generat cu succes!',
      })
      setPreview(response.data.protocol)

      // Reset form
      setProtocolData({ titleRu: '', titleRo: '', targetArea: '', duration: 30 })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Generation failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCourse = async () => {
    try {
      setLoading(true)
      setMessage(null)
      setPreview(null)

      const response = await api.post('/content-generator/course', courseData)

      setMessage({
        type: 'success',
        text: lang === 'ru'
          ? `Курс создан: ${response.data.categoriesCreated} модулей, ${response.data.topicsCreated} тем`
          : `Curs creat: ${response.data.categoriesCreated} module, ${response.data.topicsCreated} teme`,
      })
      setPreview(response.data)

      // Reset form
      setCourseData({ courseName: '', moduleCount: 5, generateContent: false })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Generation failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4">
            {lang === 'ru' ? 'AI Генератор Контента' : 'Generator de Conținut AI'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lang === 'ru'
              ? 'Автоматическая генерация тем, тестов, протоколов и курсов с помощью Claude AI'
              : 'Generare automată de teme, teste, protocoale și cursuri cu Claude AI'}
          </Typography>
        </Box>
      </Box>

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab icon={<TopicIcon />} label={lang === 'ru' ? 'Тема' : 'Temă'} />
          <Tab icon={<QuizIcon />} label={lang === 'ru' ? 'Тест' : 'Test'} />
          <Tab icon={<SpaIcon />} label={lang === 'ru' ? 'Протокол' : 'Protocol'} />
          <Tab icon={<SchoolIcon />} label={lang === 'ru' ? 'Курс' : 'Curs'} />
        </Tabs>

        {/* Generate Topic */}
        <TabPanel value={tab} index={0}>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru' ? 'Генерация темы' : 'Generare temă'}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{lang === 'ru' ? 'Категория' : 'Categorie'}</InputLabel>
                <Select
                  value={topicData.categoryId}
                  label={lang === 'ru' ? 'Категория' : 'Categorie'}
                  onChange={(e) => setTopicData({ ...topicData, categoryId: e.target.value })}
                >
                  {categories?.map((cat: any) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name[lang]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={lang === 'ru' ? 'Название темы (RU)' : 'Titlu temă (RU)'}
                value={topicData.titleRu}
                onChange={(e) => setTopicData({ ...topicData, titleRu: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={lang === 'ru' ? 'Название темы (RO)' : 'Titlu temă (RO)'}
                value={topicData.titleRo}
                onChange={(e) => setTopicData({ ...topicData, titleRo: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{lang === 'ru' ? 'Сложность' : 'Dificultate'}</InputLabel>
                <Select
                  value={topicData.difficulty}
                  label={lang === 'ru' ? 'Сложность' : 'Dificultate'}
                  onChange={(e) => setTopicData({ ...topicData, difficulty: e.target.value })}
                >
                  <MenuItem value="beginner">{lang === 'ru' ? 'Начальный' : 'Începător'}</MenuItem>
                  <MenuItem value="intermediate">{lang === 'ru' ? 'Средний' : 'Intermediar'}</MenuItem>
                  <MenuItem value="advanced">{lang === 'ru' ? 'Продвинутый' : 'Avansat'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                onClick={handleGenerateTopic}
                disabled={loading || !topicData.categoryId || !topicData.titleRu || !topicData.titleRo}
                fullWidth
              >
                {loading
                  ? lang === 'ru' ? 'Генерация...' : 'Se generează...'
                  : lang === 'ru' ? 'Сгенерировать тему' : 'Generează tema'}
              </Button>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {lang === 'ru'
                ? 'AI создаст полное описание темы, ключевые пункты, цели обучения и предварительные требования на обоих языках.'
                : 'AI va crea o descriere completă a temei, puncte cheie, obiective de învățare și cerințe prealabile în ambele limbi.'}
            </Typography>
          </Alert>
        </TabPanel>

        {/* Generate Quiz */}
        <TabPanel value={tab} index={1}>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru' ? 'Генерация теста' : 'Generare test'}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{lang === 'ru' ? 'Тема' : 'Temă'}</InputLabel>
                <Select
                  value={quizData.topicId}
                  label={lang === 'ru' ? 'Тема' : 'Temă'}
                  onChange={(e) => setQuizData({ ...quizData, topicId: e.target.value })}
                >
                  {topics?.map((topic: any) => (
                    <MenuItem key={topic._id} value={topic._id}>
                      {topic.name[lang]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={lang === 'ru' ? 'Количество вопросов' : 'Număr de întrebări'}
                value={quizData.questionCount}
                onChange={(e) => setQuizData({ ...quizData, questionCount: parseInt(e.target.value) })}
                inputProps={{ min: 5, max: 20 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{lang === 'ru' ? 'Сложность' : 'Dificultate'}</InputLabel>
                <Select
                  value={quizData.difficulty}
                  label={lang === 'ru' ? 'Сложность' : 'Dificultate'}
                  onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
                >
                  <MenuItem value="easy">{lang === 'ru' ? 'Легкий' : 'Ușor'}</MenuItem>
                  <MenuItem value="medium">{lang === 'ru' ? 'Средний' : 'Mediu'}</MenuItem>
                  <MenuItem value="hard">{lang === 'ru' ? 'Сложный' : 'Dificil'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                onClick={handleGenerateQuiz}
                disabled={loading || !quizData.topicId}
                fullWidth
              >
                {loading
                  ? lang === 'ru' ? 'Генерация...' : 'Se generează...'
                  : lang === 'ru' ? 'Сгенерировать тест' : 'Generează testul'}
              </Button>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {lang === 'ru'
                ? 'AI создаст вопросы с множественным выбором, правильными ответами и объяснениями на обоих языках.'
                : 'AI va crea întrebări cu răspunsuri multiple, răspunsuri corecte și explicații în ambele limbi.'}
            </Typography>
          </Alert>
        </TabPanel>

        {/* Generate Protocol */}
        <TabPanel value={tab} index={2}>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru' ? 'Генерация протокола массажа' : 'Generare protocol de masaj'}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={lang === 'ru' ? 'Название протокола (RU)' : 'Titlu protocol (RU)'}
                value={protocolData.titleRu}
                onChange={(e) => setProtocolData({ ...protocolData, titleRu: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={lang === 'ru' ? 'Название протокола (RO)' : 'Titlu protocol (RO)'}
                value={protocolData.titleRo}
                onChange={(e) => setProtocolData({ ...protocolData, titleRo: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={lang === 'ru' ? 'Целевая область' : 'Zona țintă'}
                value={protocolData.targetArea}
                onChange={(e) => setProtocolData({ ...protocolData, targetArea: e.target.value })}
                placeholder={lang === 'ru' ? 'Спина, шея, ноги...' : 'Spate, gât, picioare...'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={lang === 'ru' ? 'Длительность (мин)' : 'Durată (min)'}
                value={protocolData.duration}
                onChange={(e) => setProtocolData({ ...protocolData, duration: parseInt(e.target.value) })}
                inputProps={{ min: 15, max: 120 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                onClick={handleGenerateProtocol}
                disabled={loading || !protocolData.titleRu || !protocolData.titleRo}
                fullWidth
              >
                {loading
                  ? lang === 'ru' ? 'Генерация...' : 'Se generează...'
                  : lang === 'ru' ? 'Сгенерировать протокол' : 'Generează protocolul'}
              </Button>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {lang === 'ru'
                ? 'AI создаст пошаговый протокол с техниками, показаниями, противопоказаниями и советами.'
                : 'AI va crea un protocol pas cu pas cu tehnici, indicații, contraindicații și sfaturi.'}
            </Typography>
          </Alert>
        </TabPanel>

        {/* Generate Course */}
        <TabPanel value={tab} index={3}>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru' ? 'Генерация полного курса' : 'Generare curs complet'}
          </Typography>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {lang === 'ru'
                ? 'Внимание! Генерация полного курса может занять несколько минут и создать множество тем.'
                : 'Atenție! Generarea cursului complet poate dura câteva minute și va crea multe teme.'}
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={lang === 'ru' ? 'Название курса' : 'Titlu curs'}
                value={courseData.courseName}
                onChange={(e) => setCourseData({ ...courseData, courseName: e.target.value })}
                placeholder={lang === 'ru' ? 'Основы анатомии и массажа' : 'Bazele anatomiei și masajului'}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label={lang === 'ru' ? 'Количество модулей' : 'Număr de module'}
                value={courseData.moduleCount}
                onChange={(e) => setCourseData({ ...courseData, moduleCount: parseInt(e.target.value) })}
                inputProps={{ min: 3, max: 10 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{lang === 'ru' ? 'Генерировать полный контент?' : 'Generează conținut complet?'}</InputLabel>
                <Select
                  value={courseData.generateContent ? 'yes' : 'no'}
                  label={lang === 'ru' ? 'Генерировать полный контент?' : 'Generează conținut complet?'}
                  onChange={(e) => setCourseData({ ...courseData, generateContent: e.target.value === 'yes' })}
                >
                  <MenuItem value="no">
                    {lang === 'ru' ? 'Только структура (быстро)' : 'Doar structură (rapid)'}
                  </MenuItem>
                  <MenuItem value="yes">
                    {lang === 'ru' ? 'Полный контент (медленно)' : 'Conținut complet (lent)'}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                color="secondary"
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                onClick={handleGenerateCourse}
                disabled={loading || !courseData.courseName}
                fullWidth
              >
                {loading
                  ? lang === 'ru' ? 'Генерация курса... (это может занять время)' : 'Se generează cursul... (poate dura)'
                  : lang === 'ru' ? 'Сгенерировать курс' : 'Generează cursul'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Preview */}
      {preview && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {lang === 'ru' ? 'Результат генерации' : 'Rezultat generare'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <pre style={{ overflow: 'auto', fontSize: '0.875rem' }}>
              {JSON.stringify(preview, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
