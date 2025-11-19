import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm' // Для поддержки таблиц, зачеркивания и т.д.
import { Box, Typography } from '@mui/material'
import Callout from './Callout' // Предполагаем, что этот компонент существует

// Регулярное выражение для поиска и замены пользовательских блоков Callout
// Оно ищет :::TYPE [Optional Title] Content :::
const CALLOUT_REGEX = /:::(\w+)(?:\s*\[(.*?)\])?\n([\s\S]*?)\n:::/g

// Map для рендеринга пользовательских элементов
const customRenderers = {
  // Преобразование стандартного тега <table> в кастомный компонент MUI (если необходимо)
  table: ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ overflowX: 'auto', my: 2 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>{children}</table>
    </Box>
  ),
  // Преобразование <img> для стилизации MUI
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <Box sx={{ maxWidth: '100%', height: 'auto', my: 2, display: 'flex', flexDirection: 'column' }}>
        <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
        {alt && <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>{alt}</Typography>}
    </Box>
  ),
}

interface EnhancedMarkdownProps {
  content: string
}

const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({ content }) => {
  const processedContent = useMemo(() => {
    if (!content) return ''

    // 1. Пре-обработка: Замена кастомных блоков на HTML-компоненты Callout
    // Мы заменяем :::...::: на временные HTML-теги, которые ReactMarkdown не обработает
    let tempHtml = content.replace(CALLOUT_REGEX, (match, type, title, blockContent) => {
      // Кодируем содержимое, чтобы избежать проблем с Markdown-парсингом внутри Callout
      const encodedContent = encodeURIComponent(blockContent.trim())
      const encodedTitle = title ? encodeURIComponent(title.trim()) : ''
      
      // Используем специальный HTML-тег с атрибутами data-*
      return `<div 
        data-callout-type="${type.toLowerCase()}" 
        data-callout-title="${encodedTitle}" 
        data-callout-content="${encodedContent}"
      ></div>`
    })

    return tempHtml
  }, [content])

  // 2. Рендеринг: Обработка Markdown и кастомных элементов
  const renderers = useMemo(() => {
    return {
      // Наследуем стандартные рендереры
      ...customRenderers,

      // Обработка кастомного DIV-элемента, созданного на шаге 1
      div: ({ node, ...props }: any) => {
        const { 'data-callout-type': type, 'data-callout-title': title, 'data-callout-content': content } = props
        
        if (type) {
          // Если это наш кастомный блок Callout
          const decodedContent = decodeURIComponent(content || '')
          const decodedTitle = decodeURIComponent(title || '')
          
          return (
            <Box sx={{ my: 2 }}>
                <Callout type={type} title={decodedTitle} content={decodedContent} />
            </Box>
          )
        }
        
        // Если это обычный div, возвращаем его как есть
        return <div {...props} />
      },
    }
  }, [])

  return (
    <ReactMarkdown
      // Используем плагин GFM для таблиц и других расширений
      remarkPlugins={[remarkGfm]}
      // Разрешаем рендерить HTML, чтобы перехватывать наш div
      rehypePlugins={[]} 
      components={renderers}
      // Это позволяет нам вставлять HTML-теги для перехвата
      skipHtml={false} 
      className="markdown-body" 
    >
      {processedContent}
    </ReactMarkdown>
  )
}

export default EnhancedMarkdown