import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  TextField,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Chip,
  Divider,
  InputAdornment,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import {
  getUserConversations,
  getConversationMessages,
  createOrGetPrivateConversation,
  searchUsers,
} from '@/services/api'
import { useNavigate } from 'react-router-dom'

interface Message {
  _id: string
  conversationId: string
  sender: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  content: string
  type: 'text' | 'image' | 'file'
  readBy: string[]
  createdAt: string
}

interface Conversation {
  _id: string
  participants: Array<{
    _id: string
    firstName: string
    lastName: string
    email: string
    accessLevel: string
  }>
  type: 'private' | 'group'
  name?: string
  lastMessage?: {
    content: string
    timestamp: string
  }
  unreadCount: { [key: string]: number }
}

const ChatPage = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const { user, hasAccess } = useAuth()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  const {
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    on,
    off,
  } = useSocket()

  // Проверка доступа
  useEffect(() => {
    if (!hasAccess('basic')) {
      navigate('/')
    }
  }, [hasAccess, navigate])

  // Загрузка бесед
  useEffect(() => {
    loadConversations()
  }, [])

  // Socket обработчики
  useEffect(() => {
    if (!isConnected) return

    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
      if (selectedConversation?._id === data.conversationId) {
        setMessages((prev) => [...prev, data.message])
        scrollToBottom()

        // Отмечаем как прочитанное
        if (data.message.sender._id !== user?.id) {
          markMessagesAsRead(data.conversationId, [data.message._id])
        }
      }

      // Обновляем список бесед
      loadConversations()
    }

    const handleTypingStart = (data: { conversationId: string; userId: string }) => {
      if (selectedConversation?._id === data.conversationId && data.userId !== user?.id) {
        setTypingUsers((prev) => new Set(prev).add(data.userId))
      }
    }

    const handleTypingStop = (data: { conversationId: string; userId: string }) => {
      if (selectedConversation?._id === data.conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev)
          newSet.delete(data.userId)
          return newSet
        })
      }
    }

    on('message:new', handleNewMessage)
    on('typing:start', handleTypingStart)
    on('typing:stop', handleTypingStop)

    return () => {
      off('message:new', handleNewMessage)
      off('typing:start', handleTypingStart)
      off('typing:stop', handleTypingStop)
    }
  }, [isConnected, selectedConversation, user, on, off])

  // Присоединение/покидание беседы
  useEffect(() => {
    if (selectedConversation && isConnected) {
      joinConversation(selectedConversation._id)
      loadMessages(selectedConversation._id)

      return () => {
        leaveConversation(selectedConversation._id)
      }
    }
  }, [selectedConversation, isConnected])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await getUserConversations()
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true)
      const data = await getConversationMessages(conversationId)
      setMessages(data.messages)
      scrollToBottom()

      // Отмечаем все сообщения как прочитанные
      const unreadIds = data.messages
        .filter((m: Message) => !m.readBy.includes(user?.id || ''))
        .map((m: Message) => m._id)

      if (unreadIds.length > 0) {
        markMessagesAsRead(conversationId, unreadIds)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return

    sendMessage({
      conversationId: selectedConversation._id,
      content: messageInput.trim(),
      type: 'text',
    })

    setMessageInput('')
    stopTyping(selectedConversation._id)
  }

  const handleTyping = () => {
    if (selectedConversation) {
      startTyping(selectedConversation._id)

      // Останавливаем индикатор печати через 3 секунды
      setTimeout(() => {
        stopTyping(selectedConversation._id)
      }, 3000)
    }
  }

  const handleSearchUsers = async () => {
    if (!userSearchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      const results = await searchUsers(userSearchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const handleStartConversation = async (userId: string) => {
    try {
      const conversation = await createOrGetPrivateConversation(userId)
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conversation._id)
        if (exists) return prev
        return [conversation, ...prev]
      })
      setSelectedConversation(conversation)
      setSearchDialogOpen(false)
      setUserSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name || 'Группа'
    }

    const otherUser = conversation.participants.find((p) => p._id !== user?.id)
    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Неизвестный'
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name?.[0] || 'G'
    }

    const otherUser = conversation.participants.find((p) => p._id !== user?.id)
    return otherUser ? `${otherUser.firstName[0]}${otherUser.lastName[0]}` : '?'
  }

  const isUserOnline = (userId: string) => onlineUsers.includes(userId)

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        {lang === 'ru' ? 'Сообщения' : 'Mesaje'}
      </Typography>

      <Grid container spacing={2} sx={{ height: 'calc(100% - 60px)' }}>
        {/* Список бесед */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                fullWidth
                onClick={() => setSearchDialogOpen(true)}
              >
                {lang === 'ru' ? 'Новое сообщение' : 'Mesaj nou'}
              </Button>
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {conversations.map((conversation) => {
                const otherUser = conversation.participants.find((p) => p._id !== user?.id)
                const unreadCount = user?.id ? conversation.unreadCount[user.id] || 0 : 0

                return (
                  <ListItem key={conversation._id} disablePadding>
                    <ListItemButton
                      selected={selectedConversation?._id === conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <ListItemAvatar>
                        <Badge
                          color="success"
                          variant="dot"
                          invisible={
                            !otherUser || !isUserOnline(otherUser._id)
                          }
                        >
                          <Avatar>{getConversationAvatar(conversation)}</Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight={unreadCount > 0 ? 700 : 400}>
                              {getConversationName(conversation)}
                            </Typography>
                            {unreadCount > 0 && (
                              <Chip
                                label={unreadCount}
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={conversation.lastMessage?.content || ''}
                        secondaryTypographyProps={{
                          noWrap: true,
                          sx: { fontWeight: unreadCount > 0 ? 600 : 400 },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>

            {!isConnected && (
              <Box sx={{ p: 2, bgcolor: 'warning.light', textAlign: 'center' }}>
                <Typography variant="caption">
                  {lang === 'ru' ? 'Подключение...' : 'Conectare...'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Окно сообщений */}
        <Grid item xs={12} md={8}>
          {selectedConversation ? (
            <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Заголовок беседы */}
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar>{getConversationAvatar(selectedConversation)}</Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {getConversationName(selectedConversation)}
                    </Typography>
                    {selectedConversation.type === 'private' && (
                      <Typography variant="caption" color="text.secondary">
                        {(() => {
                          const otherUser = selectedConversation.participants.find(
                            (p) => p._id !== user?.id
                          )
                          return otherUser && isUserOnline(otherUser._id)
                            ? lang === 'ru'
                              ? 'В сети'
                              : 'Online'
                            : lang === 'ru'
                            ? 'Не в сети'
                            : 'Offline'
                        })()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Сообщения */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {messagesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwn = message.sender._id === user?.id
                      return (
                        <Box
                          key={message._id}
                          sx={{
                            display: 'flex',
                            justifyContent: isOwn ? 'flex-end' : 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '70%',
                              bgcolor: isOwn ? 'primary.main' : 'grey.200',
                              color: isOwn ? 'white' : 'text.primary',
                              borderRadius: 2,
                              p: 1.5,
                            }}
                          >
                            {!isOwn && (
                              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                                {message.sender.firstName} {message.sender.lastName}
                              </Typography>
                            )}
                            <Typography variant="body2">{message.content}</Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                opacity: 0.7,
                                fontSize: '0.65rem',
                              }}
                            >
                              {new Date(message.createdAt).toLocaleTimeString(lang, {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                    {typingUsers.size > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {lang === 'ru' ? 'Печатает...' : 'Scrie...'}
                      </Typography>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Box>

              {/* Ввод сообщения */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  placeholder={lang === 'ru' ? 'Введите сообщение...' : 'Scrieți un mesaj...'}
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value)
                    handleTyping()
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleSendMessage} disabled={!messageInput.trim()}>
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                {lang === 'ru'
                  ? 'Выберите беседу для начала общения'
                  : 'Selectați o conversație pentru a începe'}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Диалог поиска пользователей */}
      <Dialog
        open={searchDialogOpen}
        onClose={() => {
          setSearchDialogOpen(false)
          setUserSearchQuery('')
          setSearchResults([])
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{lang === 'ru' ? 'Найти пользователя' : 'Căutare utilizator'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder={lang === 'ru' ? 'Введите имя или email...' : 'Introduceți numele sau email...'}
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchUsers()
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearchUsers}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mt: 2 }}
          />

          <List sx={{ mt: 2 }}>
            {searchResults.map((result) => (
              <ListItem key={result._id} disablePadding>
                <ListItemButton onClick={() => handleStartConversation(result._id)}>
                  <ListItemAvatar>
                    <Avatar>
                      {result.firstName[0]}
                      {result.lastName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${result.firstName} ${result.lastName}`}
                    secondary={result.email}
                  />
                  <Chip
                    label={result.accessLevel?.toUpperCase()}
                    size="small"
                    color={result.accessLevel === 'premium' ? 'success' : 'primary'}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSearchDialogOpen(false)
              setUserSearchQuery('')
              setSearchResults([])
            }}
          >
            {lang === 'ru' ? 'Закрыть' : 'Închide'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ChatPage
