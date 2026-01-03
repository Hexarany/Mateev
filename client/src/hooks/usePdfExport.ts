import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'

type EntityType = 'massage-protocols' | 'trigger-points' | 'hygiene-guidelines' | 'anatomy-models'

interface UsePdfExportReturn {
  exportPdf: (language: 'ru' | 'ro', id?: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function usePdfExport(entityType: EntityType): UsePdfExportReturn {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportPdf = async (language: 'ru' | 'ro', id?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Build API endpoint
      const endpoint = `/export/${entityType}/pdf`
      const params = new URLSearchParams({ language })
      if (id) {
        params.append('id', id)
      }

      // Make API request
      const response = await api.post(
        `${endpoint}?${params.toString()}`,
        {},
        {
          responseType: 'blob',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      // Generate filename from response headers or create default
      let filename = `${entityType}-${language}-${Date.now()}.pdf`

      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('PDF export error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to export PDF'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { exportPdf, loading, error }
}
