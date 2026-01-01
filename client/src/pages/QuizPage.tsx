import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AccessGate from '@/components/AccessGate'
import { useAuth } from '@/contexts/AuthContext'
import { useMainButton } from '@/contexts/MainButtonContext'
import { useTelegram } from '@/contexts/TelegramContext'
import axios from 'axios'
import type { Quiz } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const QuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language as 'ru' | 'ro'
  const { hasAccess, token, loading: authLoading, user } = useAuth()
  const { setMainButton, hideMainButton } = useMainButton()
  const { isInTelegram } = useTelegram()
  const canAccess = hasAccess('premium')

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [mode, setMode] = useState<'practice' | 'exam' | null>(null)
  const [showModeDialog, setShowModeDialog] = useState(true)
  const [answerChecked, setAnswerChecked] = useState(false)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false)
  const [attempts, setAttempts] = useState<number[]>([]) // Track attempts per question

  // Load quiz from API
  useEffect(() => {
    if (authLoading || !canAccess) {
      setLoading(false)
      return
    }

    console.log('🔄 useEffect triggered, loading quiz...')
    const loadQuiz = async () => {
      if (!quizId) {
        setError('Quiz ID not provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/quizzes/${quizId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        // Shuffle answer options for each question
        const quizData = response.data
        const shuffledQuiz = {
          ...quizData,
          questions: quizData.questions.map((q: any) => {
            const correctOption = q.options[q.correctAnswer]
            const shuffledOptions = shuffleArray(q.options)
            const newCorrectIndex = shuffledOptions.findIndex(
              (opt: any) => opt.ru === correctOption.ru && opt.ro === correctOption.ro
            )

            return {
              ...q,
              options: shuffledOptions,
              correctAnswer: newCorrectIndex,
            }
          }),
        }

        console.log('📝 Quiz loaded:', shuffledQuiz)
        console.log('📝 First question:', shuffledQuiz.questions[0])
        console.log('📝 Has explanation?', shuffledQuiz.questions[0]?.explanation)

        setQuiz(shuffledQuiz)
        setError(null)
      } catch (err: any) {
        console.error('Error loading quiz:', err)
        setError(err.response?.data?.error?.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, token, authLoading, canAccess])

  // Telegram MainButton integration - During quiz
  useEffect(() => {
    if (!isInTelegram || !quiz || showResults || loading) return

    const isLastQuestion = currentQuestion >= quiz.questions.length - 1
    const buttonText = isLastQuestion
      ? t('quiz.finish')
      : t('quiz.next')

    const handleClick = () => {
      const answerIndex = parseInt(selectedAnswer)
      const newAnswers = [...answers, answerIndex]
      setAnswers(newAnswers)

      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer('')
      } else {
        setShowResults(true)
      }
    }

    setMainButton({
      text: buttonText,
      onClick: handleClick,
      disabled: !selectedAnswer
    })

    return () => hideMainButton()
  }, [isInTelegram, quiz, showResults, loading, currentQuestion, selectedAnswer, answers, t, setMainButton, hideMainButton])

  // Telegram MainButton integration - Results screen
  useEffect(() => {
    if (!isInTelegram || !quiz || !showResults) return

    const handleClick = () => {
      setCurrentQuestion(0)
      setAnswers([])
      setSelectedAnswer('')
      setShowResults(false)
    }

    setMainButton({
      text: t('quiz.tryAgain'),
      onClick: handleClick
    })

    return () => hideMainButton()
  }, [isInTelegram, quiz, showResults, t, setMainButton, hideMainButton])

  if (authLoading || loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!canAccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <AccessGate
          requiredTier="premium"
          preview={lang === 'ru' ? 'Для прохождения тестов требуется Premium-доступ.' : 'Pentru a realiza teste este necesar acces Premium.'}
          contentType={lang === 'ru' ? 'тестам' : 'teste'}
        >
          <Box />
        </AccessGate>
      </Container>
    )
  }

  if (error || !quiz) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Quiz not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          {t('quiz.backToHome')}
        </Button>
      </Container>
    )
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(event.target.value)
    setAnswerChecked(false) // Reset check when selecting new answer
  }

  const checkAnswer = () => {
    const answerIndex = parseInt(selectedAnswer)
    const correct = answerIndex === quiz.questions[currentQuestion].correctAnswer
    setIsAnswerCorrect(correct)
    setAnswerChecked(true)

    // Increment attempt counter every time user checks an answer
    const newAttempts = [...attempts]
    newAttempts[currentQuestion] = (newAttempts[currentQuestion] || 0) + 1
    setAttempts(newAttempts)
  }

  const handleNext = () => {
    const answerIndex = parseInt(selectedAnswer)

    // In Practice mode, check answer first
    if (mode === 'practice' && !answerChecked) {
      checkAnswer()
      return
    }

    // In Practice mode, don't proceed if answer is wrong
    if (mode === 'practice' && !isAnswerCorrect) {
      return
    }

    // Save answer (only if first attempt or exam mode)
    if (mode === 'exam' || attempts[currentQuestion] === 1) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = answerIndex
      setAnswers(newAnswers)
    }

    // Move to next question or show results
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer('')
      setAnswerChecked(false)
      setIsAnswerCorrect(false)
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === quiz.questions[index].correctAnswer ? 1 : 0)
    }, 0)
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedAnswer('')
    setShowResults(false)
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = (score / quiz.questions.length) * 100

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <AccessGate
          requiredTier="premium"
          preview={lang === 'ru' ? 'Для прохождения тестов требуется Premium доступ.' : 'Pentru a realiza teste este necesar acces Premium.'}
          contentType={lang === 'ru' ? 'тест' : 'test'}
        >
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h4" gutterBottom>
                {t('quiz.results')}
              </Typography>
              <Typography variant="h2" color="primary" sx={{ my: 3 }}>
                {score} / {quiz.questions.length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {percentage.toFixed(0)}% {t('quiz.correct')}
              </Typography>
              {percentage >= 70 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Отличный результат! / Rezultat excelent!
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Попробуйте еще раз! / Încercați din nou!
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Detailed Review - ONLY for Teachers/Admins */}
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {lang === 'ru' ? 'Детальный разбор' : 'Revizuire detaliată'}
            </Typography>
            <List>
              {quiz.questions.map((question, qIndex) => {
                const userAnswer = answers[qIndex]
                const isCorrect = userAnswer === question.correctAnswer
                const attemptCount = attempts[qIndex] || 1
                const hadMistakes = attemptCount > 1

                return (
                  <ListItem key={qIndex} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2, px: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                      {isCorrect ? (
                        hadMistakes ? (
                          <CheckCircleIcon sx={{ mr: 1, color: (theme) => theme.palette.warning.main }} />
                        ) : (
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        )
                      ) : (
                        <CancelIcon color="error" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {qIndex + 1}. {question.question[lang]}
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4, width: '100%' }}>
                      {isCorrect ? (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              color: hadMistakes
                                ? (theme) => theme.palette.warning.main
                                : (theme) => theme.palette.success.main,
                              fontWeight: hadMistakes ? 600 : 400
                            }}
                          >
                            {hadMistakes
                              ? (lang === 'ru'
                                  ? `⚠️ Правильно (после ${attemptCount} ${attemptCount === 2 ? 'попыток' : attemptCount === 3 ? 'попыток' : 'попыток'})`
                                  : `⚠️ Corect (după ${attemptCount} încercări)`)
                              : (lang === 'ru' ? '✓ Правильно с первой попытки!' : '✓ Corect din prima încercare!')
                            }
                          </Typography>
                          {/* Показать объяснение если были ошибки */}
                          {hadMistakes && question.explanation && question.explanation[lang] && (
                            <Box sx={{ mt: 1, p: 1.5, bgcolor: (theme) => theme.palette.warning.light, borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                <strong>{lang === 'ru' ? '💡 Пояснение:' : '💡 Explicație:'}</strong> {question.explanation[lang]}
                              </Typography>
                            </Box>
                          )}
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" color="error.main" sx={{ mb: 0.5 }}>
                            {lang === 'ru' ? 'Ваш ответ:' : 'Răspunsul dvs.:'}{' '}
                            {userAnswer >= 0 ? question.options[userAnswer][lang] : (lang === 'ru' ? 'Не отвечено' : 'Nicio alegere')}
                          </Typography>
                          <Typography variant="body2" color="success.main" sx={{ mb: 0.5 }}>
                            {lang === 'ru' ? 'Правильный ответ:' : 'Răspuns corect:'}{' '}
                            {question.options[question.correctAnswer][lang]}
                          </Typography>
                          {question.explanation && question.explanation[lang] && (
                            <Box sx={{ mt: 1, p: 1.5, bgcolor: (theme) => theme.palette.info.light, borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                <strong>{lang === 'ru' ? '💡 Пояснение:' : '💡 Explicație:'}</strong> {question.explanation[lang]}
                              </Typography>
                            </Box>
                          )}
                        </>
                      )}
                    </Box>
                  </ListItem>
                )
              })}
            </List>
          </Paper>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleRetry}
            >
              {t('quiz.tryAgain')}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              {t('quiz.backToHome')}
            </Button>
          </Box>
        </AccessGate>
      </Container>
    )
  }

  const question = quiz.questions[currentQuestion]

  // Mode selection dialog
  if (showModeDialog && !showResults) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Dialog open={showModeDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {lang === 'ru' ? 'Выберите режим теста' : 'Alegeți modul de test'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: (theme) => `2px solid ${theme.palette.primary.main}`,
                    '&:hover': { boxShadow: 6 },
                  }}
                  onClick={() => {
                    setMode('practice')
                    setShowModeDialog(false)
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      📚 {lang === 'ru' ? 'Практика' : 'Practică'}
                    </Typography>
                    <Typography variant="body2">
                      {lang === 'ru'
                        ? 'Обучающий режим с пояснениями после каждого вопроса'
                        : 'Mod de învățare cu explicații după fiecare întrebare'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: (theme) => `2px solid ${theme.palette.warning.main}`,
                    '&:hover': { boxShadow: 6 },
                  }}
                  onClick={() => {
                    setMode('exam')
                    setShowModeDialog(false)
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      🎯 {lang === 'ru' ? 'Экзамен' : 'Examen'}
                    </Typography>
                    <Typography variant="body2">
                      {lang === 'ru'
                        ? 'Проверка знаний. Только итоговый результат'
                        : 'Testare cunoștințe. Doar rezultat final'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <AccessGate
        requiredTier="premium"
        preview={lang === 'ru' ? 'Для прохождения тестов требуется Premium доступ.' : 'Pentru a realiza teste este necesar acces Premium.'}
        contentType={lang === 'ru' ? 'тест' : 'test'}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {quiz.title[lang]}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            {t('quiz.question')} {currentQuestion + 1} {t('quiz.of')}{' '}
            {quiz.questions.length}
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              {question.question[lang]}
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index.toString()}
                    control={<Radio />}
                    label={option[lang]}
                    sx={{
                      mb: 1,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* Visual Feedback for Answer Check */}
            {mode === 'practice' && answerChecked && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: isAnswerCorrect
                    ? (theme) => theme.palette.success.light
                    : (theme) => theme.palette.error.light,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {isAnswerCorrect ? (
                  <>
                    <CheckCircleIcon color="success" />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {lang === 'ru' ? '✅ Правильно!' : '✅ Corect!'}
                    </Typography>
                  </>
                ) : (
                  <>
                    <CancelIcon color="error" />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {lang === 'ru' ? '❌ Неправильно, попробуйте еще раз' : '❌ Incorect, încercați din nou'}
                    </Typography>
                  </>
                )}
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedAnswer}
              >
                {mode === 'practice' && !answerChecked
                  ? (lang === 'ru' ? 'Проверить' : 'Verifică')
                  : currentQuestion < quiz.questions.length - 1
                  ? t('quiz.next')
                  : t('quiz.finish')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </AccessGate>
    </Container>
  )
}

export default QuizPage
