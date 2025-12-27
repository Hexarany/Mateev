import { useTranslation } from 'react-i18next'
import { Box, Container, Typography, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" color="text.primary">
              {t('app.title')}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            {t('footer.description')}
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center">
            {t('footer.createdBy')}{' '}
            <Link
              component={RouterLink}
              to="/about-instructor"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {t('footer.instructorName')}
            </Link>
            , {t('footer.instructorTitle')}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t('footer.copyright')}
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
