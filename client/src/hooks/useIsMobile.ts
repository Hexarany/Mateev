import { useTheme, useMediaQuery } from '@mui/material'

/**
 * Hook to detect if device is mobile (width < md breakpoint = 900px)
 * Useful for conditional rendering and responsive layouts
 */
export function useIsMobile() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down('md'))
}

/**
 * Hook to detect if device is tablet or smaller (width < lg breakpoint = 1200px)
 */
export function useIsTablet() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down('lg'))
}

/**
 * Hook to detect if device is small mobile (width < sm breakpoint = 600px)
 */
export function useIsSmallMobile() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down('sm'))
}
