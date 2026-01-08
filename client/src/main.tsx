import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { TelegramProvider } from './contexts/TelegramContext'
import './i18n'
import './index.css'

// One-time service worker cleanup (version-based)
const SW_VERSION = '2026-01-08-v1'
const lastSwVersion = localStorage.getItem('sw_version')

if ('serviceWorker' in navigator && lastSwVersion !== SW_VERSION) {
  console.log('[SW] Cleaning up old service worker and caches...')

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister()
    })
  })

  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name)
      })
    }).then(() => {
      localStorage.setItem('sw_version', SW_VERSION)
      console.log('[SW] Cleanup complete, reloading...')
      window.location.reload()
    })
  }
}

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TelegramProvider>
          <AuthProvider>
            <FavoritesProvider>
              <ProgressProvider>
                <ThemeContextProvider>
                  <App />
                </ThemeContextProvider>
              </ProgressProvider>
            </FavoritesProvider>
          </AuthProvider>
        </TelegramProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
