import { Typography, Box, Alert } from '@mui/material'
import ConstructionIcon from '@mui/icons-material/Construction'

const QuizzesManager = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <ConstructionIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
      <Alert severity="info">
        <Typography variant="h6" gutterBottom>
          Управление тестами / Gestionarea testelor
        </Typography>
        <Typography variant="body1">
          Функционал находится в разработке. Скоро здесь можно будет создавать и редактировать тесты.
          <br />
          Funcționalitatea este în curs de dezvoltare. În curând veți putea crea și edita teste aici.
        </Typography>
      </Alert>
    </Box>
  )
}

export default QuizzesManager
