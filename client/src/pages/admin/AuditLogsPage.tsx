import { useState } from 'react'
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
  Button,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ru } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useAuditLogs, useAuditLogsStats, useAuditLogsFilters, useSearchUsers } from '@/hooks/useAuditLogs'
import type { AuditLog } from '@/hooks/useAuditLogs'

type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export default function AuditLogsPage() {
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  // Filters
  const [actionFilter, setActionFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // Date filters
  const [datePreset, setDatePreset] = useState<DatePreset>('week')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [statsDays, setStatsDays] = useState(7)

  // Apply date preset
  const applyDatePreset = (preset: DatePreset) => {
    const now = new Date()
    setDatePreset(preset)

    switch (preset) {
      case 'today':
        setStartDate(new Date(now.setHours(0, 0, 0, 0)))
        setEndDate(new Date())
        setStatsDays(1)
        break
      case 'yesterday':
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        setStartDate(new Date(yesterday.setHours(0, 0, 0, 0)))
        setEndDate(new Date(yesterday.setHours(23, 59, 59, 999)))
        setStatsDays(1)
        break
      case 'week':
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        setStartDate(weekAgo)
        setEndDate(now)
        setStatsDays(7)
        break
      case 'month':
        const monthAgo = new Date(now)
        monthAgo.setDate(monthAgo.getDate() - 30)
        setStartDate(monthAgo)
        setEndDate(now)
        setStatsDays(30)
        break
      case 'custom':
        // Keep current dates
        break
    }
  }

  // TanStack Query hooks
  const { data: filtersData } = useAuditLogsFilters()
  const { data: statsData, isLoading: statsLoading } = useAuditLogsStats(statsDays)
  const { data: usersData } = useSearchUsers(userSearchQuery)
  const { data: logsData, isLoading: logsLoading, error: logsError, refetch } = useAuditLogs({
    page: page + 1,
    limit: rowsPerPage,
    action: actionFilter || undefined,
    entityType: entityTypeFilter || undefined,
    status: statusFilter || undefined,
    userEmail: selectedUser || undefined,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  })

  const logs = logsData?.logs || []
  const totalLogs = logsData?.total || 0
  const stats = statsData
  const availableActions = filtersData?.actions || []
  const availableEntityTypes = filtersData?.entityTypes || []

  // CSV Export function
  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Status', 'Changes', 'Error']
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString('ru-RU'),
      getUserDisplay(log),
      log.action,
      log.entityType,
      log.entityId || '-',
      log.status,
      log.changes ? log.changes.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join('; ') : '-',
      log.errorMessage || '-'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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

  // Prepare chart data
  const actionChartData = stats?.actionStats?.slice(0, 10).map(item => ({
    name: item.action,
    count: item.count
  })) || []

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

      {/* Charts - Activity Visualization */}
      {stats && actionChartData.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>📊 Топ действий за период</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={actionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6">Фильтры</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              disabled={logsLoading}
            >
              Обновить
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              disabled={logs.length === 0}
            >
              Экспорт CSV
            </Button>
          </Box>
        </Box>

        {/* Date Range Filter */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Период:</Typography>
          <ToggleButtonGroup
            value={datePreset}
            exclusive
            onChange={(_, value) => value && applyDatePreset(value)}
            size="small"
            sx={{ mb: 2, flexWrap: 'wrap' }}
          >
            <ToggleButton value="today">Сегодня</ToggleButton>
            <ToggleButton value="yesterday">Вчера</ToggleButton>
            <ToggleButton value="week">Неделя</ToggleButton>
            <ToggleButton value="month">Месяц</ToggleButton>
            <ToggleButton value="custom">Выбрать</ToggleButton>
          </ToggleButtonGroup>

          {datePreset === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <DatePicker
                  label="От"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  slotProps={{ textField: { size: 'small', sx: { minWidth: 200 } } }}
                />
                <DatePicker
                  label="До"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  slotProps={{ textField: { size: 'small', sx: { minWidth: 200 } } }}
                />
              </Box>
            </LocalizationProvider>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              size="small"
              options={usersData || []}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
              renderInput={(params) => <TextField {...params} label="Пользователь" />}
              onInputChange={(_, value) => setUserSearchQuery(value)}
              onChange={(_, value) => setSelectedUser(value?.email || null)}
              noOptionsText="Начните вводить..."
            />
          </Grid>
        </Grid>
      </Paper>

      {logsError && <Alert severity="error" sx={{ mb: 2 }}>
        {logsError instanceof Error ? logsError.message : 'Ошибка загрузки логов'}
      </Alert>}

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
            {logsLoading ? (
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
