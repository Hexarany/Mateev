import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Вы - AI-ассистент образовательной платформы "Mateev Massage" для обучения массажистов.

**Ваша роль:**
- Помогать студентам изучать анатомию человека и техники массажа
- Отвечать на вопросы о мышцах, костях, нервной системе, кровообращении
- Объяснять протоколы массажа и техники работы с триггерными точками
- Давать рекомендации по гигиене и безопасности в работе массажиста

**Важные правила:**
1. **Безопасность превыше всего**: Не давайте медицинских диагнозов или советов по лечению заболеваний
2. **Образовательный фокус**: Концентрируйтесь на анатомии, физиологии и техниках массажа
3. **Профессионализм**: Используйте корректную медицинскую терминологию на русском языке
4. **Четкость**: Давайте структурированные, понятные ответы с примерами
5. **Ссылки на материалы**: Когда уместно, рекомендуйте студентам изучить соответствующие темы на платформе

**Формат ответов:**
- Используйте списки и структуру для лучшей читаемости
- Выделяйте ключевые термины
- Давайте практические примеры
- При необходимости добавляйте визуальные описания

**Ограничения:**
- НЕ диагностируйте заболевания
- НЕ назначайте лечение
- НЕ давайте советы, которые могут заменить консультацию врача
- НЕ выходите за рамки образовательного контента по массажу и анатомии`

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  message: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

/**
 * Send a chat message to Claude AI
 */
export async function sendChatMessage(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    })

    const messageContent = response.content[0]
    if (messageContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    return {
      message: messageContent.text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    }
  } catch (error: any) {
    console.error('[Claude AI] Error:', error.message)

    // Handle specific API errors
    if (error.status === 429) {
      throw new Error('Превышен лимит запросов. Пожалуйста, попробуйте позже.')
    }
    if (error.status === 401) {
      throw new Error('Ошибка аутентификации API')
    }

    throw new Error('Произошла ошибка при обращении к AI-ассистенту')
  }
}

/**
 * Generate quiz questions based on a topic
 */
export async function generateQuizQuestions(
  topicName: string,
  topicDescription: string,
  questionCount: number = 5
): Promise<any[]> {
  try {
    const prompt = `Создай ${questionCount} вопросов для квиза по теме: "${topicName}"

Описание темы: ${topicDescription}

Требования к вопросам:
- Каждый вопрос должен проверять важные знания по теме
- 4 варианта ответа для каждого вопроса
- Только один правильный ответ
- Вопросы должны быть четкими и однозначными
- Используй корректную медицинскую терминологию

Формат ответа (JSON):
[
  {
    "question": "текст вопроса",
    "options": ["вариант 1", "вариант 2", "вариант 3", "вариант 4"],
    "correctAnswer": 0,
    "explanation": "объяснение правильного ответа"
  }
]

Верни только JSON массив, без дополнительного текста.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const messageContent = response.content[0]
    if (messageContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse JSON from response
    const jsonMatch = messageContent.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz questions from AI response')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error: any) {
    console.error('[Claude AI] Quiz generation error:', error.message)
    throw new Error('Не удалось сгенерировать вопросы для квиза')
  }
}

/**
 * Analyze student's learning progress and provide recommendations
 */
export async function analyzeProgress(
  completedTopics: string[],
  quizScores: { topic: string; score: number }[],
  weakAreas: string[]
): Promise<string> {
  try {
    const prompt = `Проанализируй прогресс студента и дай рекомендации:

**Пройденные темы:** ${completedTopics.join(', ')}

**Результаты квизов:**
${quizScores.map(q => `- ${q.topic}: ${q.score}%`).join('\n')}

**Слабые области:** ${weakAreas.join(', ')}

Дай персонализированные рекомендации:
1. Что студент освоил хорошо
2. На какие темы стоит обратить больше внимания
3. Какие темы изучить следующими
4. Практические советы для улучшения знаний

Ответ должен быть мотивирующим и конструктивным.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const messageContent = response.content[0]
    if (messageContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    return messageContent.text
  } catch (error: any) {
    console.error('[Claude AI] Progress analysis error:', error.message)
    throw new Error('Не удалось проанализировать прогресс')
  }
}
