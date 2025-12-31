import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'

interface AuditLog {
  _id: string
  userId?: {
    _id: string
    email: string
    firstName: string
    lastName: string
  }
  userEmail?: string
  action: string
  entityType: string
  entityId?: string
  changes?: {
    field: string
    oldValue?: any
    newValue?: any
  }[]
  metadata?: any
  timestamp: string
  status: 'success' | 'failure'
  errorMessage?: string
}

interface Stats {
  totalLogs: number
  failedLogs: number
  successRate: number
  actionStats: any[]
}

export default function AuditLogsPage() {
  const { token } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [totalLogs, setTotalLogs] = useState(0)

  // Filters
  const [actionFilter, setActionFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [availableActions, setAvailableActions] = useState<string[]>([])
  const [availableEntityTypes, setAvailableEntityTypes] = useState<string[]>([])

  useEffect(() => {
    loadFilters()
    loadStats()
  }, [])

  useEffect(() => {
    loadLogs()
  }, [page, rowsPerPage, actionFilter, entityTypeFilter, statusFilter])

  const loadFilters = async () => {
    try {
      const response = await api.get('/audit-logs/filters', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAvailableActions(response.data.actions)
      setAvailableEntityTypes(response.data.entityTypes)
    } catch (err) {
      console.error('Error loading filters:', err)
    }
  }

  const loadStats = async () => {
    try {
      const response = await api.get('/audit-logs/stats?days=7', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStats(response.data)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const loadLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.append('page', String(page + 1))
      params.append('limit', String(rowsPerPage))
      if (actionFilter) params.append('action', actionFilter)
      if (entityTypeFilter) params.append('entityType', entityTypeFilter)
      if (statusFilter) params.append('status', statusFilter)

      const response = await api.get(`/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setLogs(response.data.logs)
      setTotalLogs(response.data.total)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки логов')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU')
  }

  const getUserDisplay = (log: AuditLog) => {
    if (log.userId) {
      return `${log.userId.firstName} ${log.userId.lastName} (${log.userId.email})`
    }
    return log.userEmail || 'Система'
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon /> Журнал действий
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <HistoryIcon color="primary" />
                  <Typography variant="h6">{stats.totalLogs}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Всего записей (7 дней)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SuccessIcon color="success" />
                  <Typography variant="h6">{stats.totalLogs - stats.failedLogs}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Успешных
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ErrorIcon color="error" />
                  <Typography variant="h6">{stats.failedLogs}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Ошибок
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUpIcon color="info" />
                  <Typography variant="h6">{stats.successRate.toFixed(1)}%</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Успешность
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Фильтры</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Действие</InputLabel>
              <Select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                label="Действие"
              >
                <MenuItem value="">Все</MenuItem>
                {availableActions.map((action) => (
                  <MenuItem key={action} value={action}>{action}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Тип сущности</InputLabel>
              <Select
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
                label="Тип сущности"
              >
                <MenuItem value="">Все</MenuItem>
                {availableEntityTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Статус"
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="success">Успешно</MenuItem>
                <MenuItem value="failure">Ошибка</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Logs Table */}
      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          '& .MuiTableCell-root': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 8px', sm: '12px 16px' },
          },
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Дата/Время</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Действие</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>ID</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Детали</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Логи не найдены
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell>{getUserDisplay(log)}</TableCell>
                  <TableCell><Chip label={log.action} size="small" /></TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {log.entityId ? log.entityId.substring(0, 8) + '...' : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={log.status === 'success' ? <SuccessIcon /> : <ErrorIcon />}
                      label={log.status === 'success' ? 'Успех' : 'Ошибка'}
                      color={log.status === 'success' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {log.changes && log.changes.length > 0 && (
                      <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 0, p: 0 }}>
                          <Typography variant="caption">Изменения ({log.changes.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 1 }}>
                          {log.changes.map((change, idx) => (
                            <Box key={idx} sx={{ mb: 0.5 }}>
                              <Typography variant="caption" fontWeight="bold">{change.field}:</Typography>
                              <Typography variant="caption" display="block">
                                {String(change.oldValue)} → {String(change.newValue)}
                              </Typography>
                            </Box>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    )}
                    {log.errorMessage && (
                      <Typography variant="caption" color="error">{log.errorMessage}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalLogs}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value))
            setPage(0)
          }}
          labelRowsPerPage="Записей на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </TableContainer>
    </Box>
  )
}
