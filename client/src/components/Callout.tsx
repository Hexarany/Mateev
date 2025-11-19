import React from 'react'
import { Alert, AlertTitle, Box } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'

// Импортируем сам EnhancedMarkdown для рекурсивного рендеринга
// ВАЖНО: Это потребует обновить импорт, чтобы избежать циклической зависимости,
// но для простоты я предполагаю, что EnhancedMarkdown может быть импортирован.
// В реальном проекте лучше использовать отдельный компонент рендера или библиотеку
// (Здесь я использую условный импорт, чтобы показать структуру)
// import RecursiveMarkdown from './RecursiveMarkdown' 

interface CalloutProps {
  type: 'info' | 'warning' | 'danger' | 'clinical' | 'success' | string
  title?: string
  content: string
}

const Callout: React.FC<CalloutProps> = ({ type, title, content }) => {
  const normalizedType = type.toLowerCase()

  let severity: 'info' | 'warning' | 'error' | 'success' = 'info'
  let icon = <InfoIcon />
  let defaultTitle = ''

  switch (normalizedType) {
    case 'warning':
    case 'danger':
      severity = 'warning'
      icon = <WarningIcon />
      defaultTitle = 'Внимание'
      break
    case 'clinical':
      severity = 'info'
      icon = <BlockIcon />
      defaultTitle = 'Клиническое значение'
      break
    case 'success':
      severity = 'success'
      icon = <CheckCircleIcon />
      defaultTitle = 'Рекомендация'
      break
    case 'info':
    default:
      severity = 'info'
      icon = <InfoIcon />
      defaultTitle = 'Информация'
      break
  }

  // ВАЖНО: В Production вы должны использовать компонент, который
  // может рекурсивно рендерить Markdown (например, RecursiveMarkdown)
  // Мы используем простой <p> для демонстрации, но в реальном коде
  // здесь должен быть рекурсивный рендер.
  // const ContentRenderer = (
  //   <RecursiveMarkdown content={content} />
  // )

  return (
    <Alert 
      severity={severity} 
      icon={icon} 
      sx={{ 
        my: 2, 
        borderLeft: `5px solid ${severity === 'warning' ? 'orange' : severity === 'success' ? 'green' : 'blue'}`, 
        backgroundColor: severity === 'warning' ? '#fffbe6' : severity === 'success' ? '#f6ffed' : '#e6f7ff',
        color: '#333'
      }}
    >
      <AlertTitle sx={{ fontWeight: 'bold' }}>{title || defaultTitle}</AlertTitle>
      
      {/* ВНИМАНИЕ: Для финальной версии здесь должен быть компонент, 
        который рекурсивно обрабатывает Markdown в 'content'.
        Я использую DangerouslySetInnerHTML для демонстрации, что 
        ContentRender получил чистый HTML/текст, который должен быть
        обработан Markdown-рендером.
      */}
      <div 
        dangerouslySetInnerHTML={{ __html: content }} 
        style={{ color: '#333' }}
      />
    </Alert>
  )
}

export default Callout