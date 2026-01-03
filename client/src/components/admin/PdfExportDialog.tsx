import { useState } from 'react'
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
  onExport: (language: 'ru' | 'ro', exportType: 'single' | 'all') => Promise<void>
  entityType: string
  entityName?: string
  singleMode?: boolean
  loading?: boolean
}

const PdfExportDialog: React.FC<PdfExportDialogProps> = ({
  open,
  onClose,
  onExport,
  entityType,
  entityName,
  singleMode = false,
  loading = false,
}) => {
  const [language, setLanguage] = useState<'ru' | 'ro'>('ru')
  const [exportType, setExportType] = useState<'single' | 'all'>('all')

  const handleExport = async () => {
    const type = singleMode ? 'single' : exportType
    await onExport(language, type)
  }

  const getEntityDisplayName = (type: string, lang: 'ru' | 'ro') => {
    const names: Record<string, { ru: string; ro: string }> = {
      'massage-protocols': { ru: 'Протоколы массажа', ro: 'Protocoale de masaj' },
      'trigger-points': { ru: 'Триггерные точки', ro: 'Puncte de declanșare' },
      'hygiene-guidelines': { ru: 'Правила гигиены', ro: 'Reguli de igienă' },
      'anatomy-models': { ru: '3D Модели анатомии', ro: 'Modele 3D de anatomie' },
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
                onChange={(e) => setExportType(e.target.value as 'single' | 'all')}
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
