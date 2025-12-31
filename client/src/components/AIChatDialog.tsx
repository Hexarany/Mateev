import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Button,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatDialogProps {
  open: boolean
  onClose: () => void
  initialMessage?: string
  contextMessage?: string
  topicName?: string
}

export default function AIChatDialog({
  open,
  onClose,
  initialMessage,
  contextMessage,
  topicName,
}: AIChatDialogProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (open) {
      fetchUsageStats()
      if (initialMessage) {
        handleSendMessage(initialMessage)
      }
    }
  }, [open, initialMessage])

  const fetchUsageStats = async () => {
    try {
      const response = await api.get('/ai/usage')
      setRemainingRequests(response.data.remaining)
    } catch (err) {
      console.error('Failed to fetch usage stats:', err)
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim()) return

    const userMessage: Message = { role: 'user', content: textToSend }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const payload: any = {
        message: contextMessage ? `${contextMessage}\n\n${textToSend}` : textToSend,
        conversationHistory: messages,
      }

      const response = await api.post('/ai/chat', payload)

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setRemainingRequests(response.data.remainingRequests)
    } catch (err: any) {
      console.error('AI chat error:', err)

      if (err.response?.status === 429) {
        setError(t('ai.limitReached'))
      } else {
        setError(err.response?.data?.error || t('ai.error'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? '100vh' : '80vh',
          maxHeight: isMobile ? '100vh' : 700,
          m: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="primary" />
          <Typography variant="h6">
            {topicName
              ? t('ai.contextHelp', { topicName })
              : t('ai.chatTitle')
            }
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {remainingRequests !== null && (
        <Box sx={{ px: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {t('ai.remainingRequests')}
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {remainingRequests}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={remainingRequests > 0 ? Math.min((remainingRequests / 50) * 100, 100) : 0}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>
      )}

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 2, sm: 3 } }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {messages.length === 0 && !loading && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('ai.exampleQuestions.title')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {['q1', 'q2', 'q3', 'q4'].map((key) => (
                <Chip
                  key={key}
                  label={t(`ai.exampleQuestions.${key}`)}
                  onClick={() => handleExampleClick(t(`ai.exampleQuestions.${key}`))}
                  sx={{
                    justifyContent: 'flex-start',
                    height: 'auto',
                    py: 1,
                    '& .MuiChip-label': {
                      whiteSpace: 'normal',
                      textAlign: 'left',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {message.role === 'user' ? <PersonIcon fontSize="small" /> : <AIIcon fontSize="small" />}
              </Box>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '75%',
                  bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'secondary.main',
                  color: 'white',
                }}
              >
                <AIIcon fontSize="small" />
              </Box>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    {t('ai.thinking')}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('ai.placeholder')}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                color="primary"
              >
                <SendIcon />
              </IconButton>
            ),
          }}
        />
      </DialogActions>
    </Dialog>
  )
}
