import { useEffect, useState } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material'
import GetAppIcon from '@mui/icons-material/GetApp'
import { useTranslation } from 'react-i18next'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const InstallPWA = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallDialog, setShowInstallDialog] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Показываем диалог только если пользователь еще не установил
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      if (!isInstalled) {
        // Показываем через 3 секунды после загрузки страницы
        setTimeout(() => {
          setShowInstallDialog(true)
        }, 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallDialog(false)
  }

  const handleClose = () => {
    setShowInstallDialog(false)
  }

  if (!deferredPrompt) {
    return null
  }

  return (
    <>
      <Dialog open={showInstallDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {lang === 'ru' ? 'Установить приложение' : 'Instalați aplicația'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>
              {lang === 'ru'
                ? 'Установите Anatomia на свое устройство для быстрого доступа и работы офлайн!'
                : 'Instalați Anatomia pe dispozitivul dvs. pentru acces rapid și lucru offline!'}
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li">
                {lang === 'ru' ? '📱 Работает как нативное приложение' : '📱 Funcționează ca o aplicație nativă'}
              </Typography>
              <Typography component="li">
                {lang === 'ru' ? '🔌 Доступ офлайн к изученным материалам' : '🔌 Acces offline la materiale studiate'}
              </Typography>
              <Typography component="li">
                {lang === 'ru' ? '⚡ Быстрая загрузка' : '⚡ Încărcare rapidă'}
              </Typography>
              <Typography component="li">
                {lang === 'ru' ? '🔔 Push-уведомления (скоро)' : '🔔 Notificări push (în curând)'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{lang === 'ru' ? 'Позже' : 'Mai târziu'}</Button>
          <Button onClick={handleInstallClick} variant="contained" startIcon={<GetAppIcon />}>
            {lang === 'ru' ? 'Установить' : 'Instalează'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating install button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<GetAppIcon />}
        onClick={() => setShowInstallDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          display: { xs: 'none', sm: 'flex' },
        }}
      >
        {lang === 'ru' ? 'Установить' : 'Instalează'}
      </Button>
    </>
  )
}

export default InstallPWA
