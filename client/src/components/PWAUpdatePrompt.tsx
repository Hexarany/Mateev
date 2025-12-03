import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Snackbar, Button, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'

const PWAUpdatePrompt = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'

  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
    onNeedRefresh() {
      setShowUpdatePrompt(true)
    },
  })

  const handleUpdate = () => {
    updateServiceWorker(true)
    setShowUpdatePrompt(false)
  }

  const handleClose = () => {
    setShowUpdatePrompt(false)
  }

  return (
    <Snackbar
      open={showUpdatePrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 2 }}
    >
      <Alert
        severity="info"
        action={
          <>
            <Button color="inherit" size="small" onClick={handleUpdate}>
              {lang === 'ru' ? 'Обновить' : 'Actualizează'}
            </Button>
            <Button color="inherit" size="small" onClick={handleClose}>
              {lang === 'ru' ? 'Позже' : 'Mai târziu'}
            </Button>
          </>
        }
      >
        {lang === 'ru'
          ? 'Доступна новая версия приложения!'
          : 'O nouă versiune a aplicației este disponibilă!'}
      </Alert>
    </Snackbar>
  )
}

export default PWAUpdatePrompt
