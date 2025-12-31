import { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button, Snackbar, Alert, Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import GetAppIcon from '@mui/icons-material/GetApp'
import RefreshIcon from '@mui/icons-material/Refresh'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA Install Prompt Component
 *
 * Features:
 * - Install prompt for PWA
 * - Service Worker update notification
 * - Offline capability indicator
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // Service Worker update handling
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 5000) // Show after 5 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setShowInstallPrompt(false)
    } else {
      console.log('User dismissed the install prompt')
      // Don't show again for this session
      setShowInstallPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleUpdate = () => {
    updateServiceWorker(true)
  }

  const handleClose = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (isInstalled) {
    return null
  }

  return (
    <>
      {/* Install Prompt */}
      <Snackbar
        open={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert
          severity="info"
          icon={<GetAppIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                onClick={handleInstallClick}
              >
                Установить
              </Button>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setShowInstallPrompt(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{ width: '100%', alignItems: 'center' }}
        >
          Установите Anatomia для быстрого доступа и работы офлайн
        </Alert>
      </Snackbar>

      {/* Update Available */}
      <Snackbar
        open={needRefresh}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert
          severity="success"
          icon={<RefreshIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                onClick={handleUpdate}
              >
                Обновить
              </Button>
              <IconButton size="small" color="inherit" onClick={handleClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{ width: '100%', alignItems: 'center' }}
        >
          Доступна новая версия приложения!
        </Alert>
      </Snackbar>

      {/* Offline Ready */}
      <Snackbar
        open={offlineReady}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert severity="success" onClose={handleClose}>
          Приложение готово к работе офлайн!
        </Alert>
      </Snackbar>
    </>
  )
}
