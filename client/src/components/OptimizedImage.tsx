import { useState } from 'react'
import { Box, Skeleton } from '@mui/material'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  borderRadius?: number | string
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

/**
 * Optimized image component with lazy loading and skeleton placeholder
 *
 * Features:
 * - Native lazy loading (loading="lazy")
 * - Skeleton placeholder while loading
 * - Smooth fade-in transition when loaded
 * - Error handling with fallback UI
 * - Responsive sizing
 */
export default function OptimizedImage({
  src,
  alt,
  width = '100%',
  height = 200,
  objectFit = 'cover',
  borderRadius = 0,
  onClick,
  className,
  style,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      className={className}
      onClick={onClick}
    >
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius,
          }}
        />
      )}

      {error ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          Failed to load image
        </Box>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true)
            setLoaded(true)
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            display: loaded ? 'block' : 'none',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
    </Box>
  )
}
