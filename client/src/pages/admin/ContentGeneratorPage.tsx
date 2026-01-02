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
  Grid,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import QuizIcon from '@mui/icons-material/Quiz'
import AdjustIcon from '@mui/icons-material/Adjust'
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

  // Fetch topics for dropdowns
  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await api.get('/topics')
      return response.data
    },
  })

  // Quiz generation state
  const [quizData, setQuizData] = useState({
    topicId: '',
    questionCount: 10,
    difficulty: 'medium',
  })

  // Trigger points generation state
  const [triggerPointData, setTriggerPointData] = useState({
    muscleName: '',
    region: '',
    pointCount: 5,
  })

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

  const handleGenerateTriggerPoints = async () => {
    try {
      setLoading(true)
      setMessage(null)
      setPreview(null)

      const response = await api.post('/content-generator/trigger-points', triggerPointData)

      setMessage({
        type: 'success',
        text: lang === 'ru'
          ? `Триггерные точки для ${triggerPointData.muscleName} успешно сгенерированы!`
          : `Puncte trigger pentru ${triggerPointData.muscleName} generate cu succes!`,
      })
      setPreview(response.data)

      // Reset form
      setTriggerPointData({ muscleName: '', region: '', pointCount: 5 })
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
        <AutoAwesomeIcon sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main }} />
        <Box>
          <Typography variant="h4">
            {lang === 'ru' ? 'AI Генератор Контента' : 'Generator de Conținut AI'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {lang === 'ru'
              ? 'Автоматическая генерация тестов и триггерных точек с помощью Claude AI'
              : 'Generare automată de teste și puncte trigger cu Claude AI'}
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
          <Tab icon={<QuizIcon />} label={lang === 'ru' ? 'Тест' : 'Test'} />
          <Tab icon={<AdjustIcon />} label={lang === 'ru' ? 'Триггерные точки' : 'Puncte Trigger'} />
        </Tabs>

        {/* Generate Quiz */}
        <TabPanel value={tab} index={0}>
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

        {/* Generate Trigger Points */}
        <TabPanel value={tab} index={1}>
          <Typography variant="h6" gutterBottom>
            {lang === 'ru' ? 'Генерация триггерных точек' : 'Generare puncte trigger'}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={lang === 'ru' ? 'Название мышцы' : 'Nume mușchi'}
                value={triggerPointData.muscleName}
                onChange={(e) => setTriggerPointData({ ...triggerPointData, muscleName: e.target.value })}
                placeholder={lang === 'ru' ? 'Трапециевидная мышца' : 'Mușchiul trapez'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={lang === 'ru' ? 'Регион тела' : 'Regiune corporală'}
                value={triggerPointData.region}
                onChange={(e) => setTriggerPointData({ ...triggerPointData, region: e.target.value })}
                placeholder={lang === 'ru' ? 'Шея и плечи' : 'Gât și umeri'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={lang === 'ru' ? 'Количество точек' : 'Număr de puncte'}
                value={triggerPointData.pointCount}
                onChange={(e) => setTriggerPointData({ ...triggerPointData, pointCount: parseInt(e.target.value) })}
                inputProps={{ min: 3, max: 10 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                onClick={handleGenerateTriggerPoints}
                disabled={loading || !triggerPointData.muscleName}
                fullWidth
              >
                {loading
                  ? lang === 'ru' ? 'Генерация...' : 'Se generează...'
                  : lang === 'ru' ? 'Сгенерировать точки' : 'Generează punctele'}
              </Button>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {lang === 'ru'
                ? 'AI создаст подробное описание триггерных точек с локализацией, симптомами, методами пальпации и техниками воздействия на обоих языках.'
                : 'AI va crea o descriere detaliată a punctelor trigger cu localizare, simptome, metode de palpare și tehnici de tratare în ambele limbi.'}
            </Typography>
          </Alert>
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
