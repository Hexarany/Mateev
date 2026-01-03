import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CloseIcon from '@mui/icons-material/Close'

interface PdfExportDialogProps {
  open: boolean
  onClose: () => void
  onExport: (language: 'ru' | 'ro', id?: string) => Promise<void>
  entityType: string
  entityName?: string
  singleMode?: boolean
  loading?: boolean
  items?: Array<{ _id: string; name: { ru: string; ro: string } }>
}

const PdfExportDialog: React.FC<PdfExportDialogProps> = ({
  open,
  onClose,
  onExport,
  entityType,
  entityName,
  singleMode = false,
  loading = false,
  items = [],
}) => {
  const [language, setLanguage] = useState<'ru' | 'ro'>('ru')
  const [exportType, setExportType] = useState<'all' | 'single' | 'selected'>('all')
  const [selectedItemId, setSelectedItemId] = useState<string>('')

  // Reset selected item when items change
  useEffect(() => {
    if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0]._id)
    }
  }, [items])

  // Reset to 'all' when dialog opens
  useEffect(() => {
    if (open) {
      setExportType('all')
      if (items.length > 0) {
        setSelectedItemId(items[0]._id)
      }
    }
  }, [open, items])

  const handleExport = async () => {
    if (singleMode) {
      // Single mode: always export without ID (relies on editing context)
      await onExport(language, undefined)
    } else if (exportType === 'all') {
      // Export all items
      await onExport(language, undefined)
    } else if (exportType === 'single') {
      // Export currently editing item (no ID needed, context-based)
      await onExport(language, undefined)
    } else if (exportType === 'selected') {
      // Export selected item from dropdown
      await onExport(language, selectedItemId)
    }
  }

  const getEntityDisplayName = (type: string, lang: 'ru' | 'ro') => {
    const names: Record<string, { ru: string; ro: string }> = {
      'massage-protocols': { ru: 'Протоколы массажа', ro: 'Protocoale de masaj' },
      'trigger-points': { ru: 'Триггерные точки', ro: 'Puncte de declanșare' },
      'hygiene-guidelines': { ru: 'Правила гигиены', ro: 'Reguli de igienă' },
      'topics': { ru: 'Темы по анатомии', ro: 'Teme de anatomie' },
    }
    return names[type]?.[lang] || type
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PictureAsPdfIcon color="primary" />
          <Typography variant="h6">
            {language === 'ru' ? 'Экспорт в PDF' : 'Export PDF'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {/* Language Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{language === 'ru' ? 'Язык' : 'Limba'}</InputLabel>
            <Select
              value={language}
              label={language === 'ru' ? 'Язык' : 'Limba'}
              onChange={(e) => setLanguage(e.target.value as 'ru' | 'ro')}
              disabled={loading}
            >
              <MenuItem value="ru">Русский (Russian)</MenuItem>
              <MenuItem value="ro">Română (Romanian)</MenuItem>
            </Select>
          </FormControl>

          {/* Export Type Selection (only if not in single mode) */}
          {!singleMode && (
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">
                {language === 'ru' ? 'Тип экспорта' : 'Tip export'}
              </FormLabel>
              <RadioGroup
                value={exportType}
                onChange={(e) => setExportType(e.target.value as 'all' | 'single' | 'selected')}
              >
                <FormControlLabel
                  value="all"
                  control={<Radio />}
                  label={
                    language === 'ru'
                      ? `Все ${getEntityDisplayName(entityType, 'ru').toLowerCase()}`
                      : `Toate ${getEntityDisplayName(entityType, 'ro').toLowerCase()}`
                  }
                  disabled={loading}
                />

                {/* Option to select specific item from list */}
                {items.length > 0 && (
                  <FormControlLabel
                    value="selected"
                    control={<Radio />}
                    label={
                      language === 'ru'
                        ? 'Выбрать конкретный элемент'
                        : 'Selectați un element specific'
                    }
                    disabled={loading}
                  />
                )}

                {/* Option to export currently editing item */}
                {entityName && (
                  <FormControlLabel
                    value="single"
                    control={<Radio />}
                    label={
                      language === 'ru'
                        ? `Только "${entityName}"`
                        : `Doar "${entityName}"`
                    }
                    disabled={loading}
                  />
                )}
              </RadioGroup>
            </FormControl>
          )}

          {/* Item Selection Dropdown (when "selected" is chosen) */}
          {!singleMode && exportType === 'selected' && items.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                {language === 'ru' ? 'Выберите элемент' : 'Selectați elementul'}
              </InputLabel>
              <Select
                value={selectedItemId}
                label={language === 'ru' ? 'Выберите элемент' : 'Selectați elementul'}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={loading}
              >
                {items.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.name[language]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Single mode info */}
          {singleMode && entityName && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {language === 'ru' ? 'Экспорт:' : 'Export:'}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                {entityName}
              </Typography>
            </Box>
          )}

          {/* Loading state */}
          {loading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mt: 2,
                p: 2,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 1,
              }}
            >
              <CircularProgress size={24} color="inherit" />
              <Typography variant="body2">
                {language === 'ru' ? 'Генерация PDF...' : 'Generare PDF...'}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} startIcon={<CloseIcon />}>
          {language === 'ru' ? 'Отмена' : 'Anulare'}
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
        >
          {language === 'ru' ? 'Экспорт' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PdfExportDialog
