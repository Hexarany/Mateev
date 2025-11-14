import { Typography, Box, Alert } from '@mui/material'
import ConstructionIcon from '@mui/icons-material/Construction'

const MediaManager = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <ConstructionIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
      <Alert severity="info">
        <Typography variant="h6" gutterBottom>
          Управление медиафайлами / Gestionarea fișierelor media
        </Typography>
        <Typography variant="body1">
          Функционал находится в разработке. Скоро здесь можно будет загружать изображения, видео и 3D модели.
          <br />
          Funcționalitatea este în curs de dezvoltare. În curând veți putea încărca imagini, videoclipuri și modele 3D.
        </Typography>
      </Alert>
    </Box>
  )
}

export default MediaManager
