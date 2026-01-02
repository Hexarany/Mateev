import Anthropic from '@anthropic-ai/sdk'
import Category from '../models/Category'
import Topic from '../models/Topic'
import Quiz from '../models/Quiz'
import MassageProtocol from '../models/MassageProtocol'

// Lazy initialization to ensure env vars are loaded
let anthropicClient: Anthropic | null = null
function getAnthropicClient() {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured')
    }
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return anthropicClient
}

/**
 * Helper function to extract JSON from Claude's response
 * Removes markdown code blocks if present
 */
function parseClaudeJSON(text: string): any {
  // Remove markdown code blocks if present
  let cleanedText = text.trim()

  // Remove ```json and ``` markers
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '')
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '')
  }

  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.replace(/\s*```$/, '')
  }

  cleanedText = cleanedText.trim()

  // Replace typographic quotes with regular quotes
  // Romanian/German quotes: „" → ""
  // French quotes: «» → ""
  // Curly quotes: "" → ""
  cleanedText = cleanedText
    .replace(/[„"]/g, '"')  // Romanian/German quotes
    .replace(/[«»]/g, '"')   // French quotes
    .replace(/['']/g, "'")   // Curly single quotes
    .replace(/—/g, '-')      // Em dash to regular dash

  try {
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error('JSON Parse Error:')
    console.error('Position:', (error as any).message)
    console.error('Raw text length:', text.length)
    console.error('First 500 chars:', text.substring(0, 500))
    console.error('Last 500 chars:', text.substring(text.length - 500))

    // Try to find the error position
    const match = (error as any).message.match(/position (\d+)/)
    if (match) {
      const pos = parseInt(match[1])
      console.error('Context around error:')
      console.error(cleanedText.substring(Math.max(0, pos - 100), Math.min(cleanedText.length, pos + 100)))
    }

    throw new Error(`Failed to parse Claude response: ${(error as any).message}`)
  }
}

interface GenerateTopicParams {
  categoryId: string
  topicTitle: { ru: string; ro: string }
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

interface GenerateQuizParams {
  topicId: string
  questionCount?: number
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface GenerateProtocolParams {
  protocolTitle: { ru: string; ro: string }
  targetArea: string
  duration?: number
}

/**
 * Generate topic content using Claude AI
 */
export async function generateTopicContent(params: GenerateTopicParams) {
  const { categoryId, topicTitle, difficulty = 'intermediate' } = params

  const category = await Category.findById(categoryId)
  if (!category) {
    throw new Error('Category not found')
  }

  const prompt = `You are a medical education expert specializing in anatomy and massage therapy.

Generate comprehensive educational content for a topic about "${topicTitle.ru}" (Romanian: "${topicTitle.ro}") in the category "${category.name.ru}".

Difficulty level: ${difficulty}

Provide the content in JSON format with the following structure:
{
  "description_ru": "Detailed Russian description (3-5 paragraphs, markdown supported)",
  "description_ro": "Detailed Romanian description (3-5 paragraphs, markdown supported)",
  "keyPoints_ru": ["key point 1", "key point 2", ...] (5-7 points),
  "keyPoints_ro": ["key point 1", "key point 2", ...] (5-7 points),
  "prerequisites_ru": "Prerequisites in Russian",
  "prerequisites_ro": "Prerequisites in Romanian",
  "learningObjectives_ru": ["objective 1", ...] (4-6 objectives),
  "learningObjectives_ro": ["objective 1", ...] (4-6 objectives)
}

Make sure the content is:
- Medically accurate and evidence-based
- Appropriate for ${difficulty} level students
- Includes practical applications for massage therapy
- Well-structured with clear explanations
- Uses proper medical terminology

Return ONLY valid JSON, no additional text.`

  const response = await getAnthropicClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 6000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Check if response was truncated
  if (response.stop_reason === 'max_tokens') {
    console.error('Topic generation response was truncated due to max_tokens limit')
    throw new Error('Ответ был обрезан из-за ограничения токенов. Попробуйте упростить описание темы.')
  }

  const generatedContent = parseClaudeJSON(content.text)

  // Generate slug from topic title
  const slug = topicTitle.ru
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now()

  return {
    name: topicTitle,
    slug,
    categoryId: categoryId,
    description: {
      ru: generatedContent.description_ru,
      ro: generatedContent.description_ro,
    },
    content: {
      ru: generatedContent.description_ru,
      ro: generatedContent.description_ro,
    },
    keyPoints: {
      ru: generatedContent.keyPoints_ru,
      ro: generatedContent.keyPoints_ro,
    },
    order: 0,
    estimatedTime: difficulty === 'beginner' ? 30 : difficulty === 'intermediate' ? 45 : 60,
    difficulty,
  }
}

/**
 * Helper: Generate a batch of questions for a specific difficulty level
 */
async function generateQuestionBatch(topic: any, count: number, difficulty: 'easy' | 'medium' | 'hard') {
  const batchSize = 30 // Claude works best with smaller batches
  const batches = Math.ceil(count / batchSize)
  const allQuestions: any[] = []

  for (let i = 0; i < batches; i++) {
    const questionsInBatch = Math.min(batchSize, count - (i * batchSize))

    const prompt = `You are a medical education expert creating assessment questions.

Generate ${questionsInBatch} multiple-choice quiz questions for the topic "${topic.name.ru}" (Romanian: "${topic.name.ro}").

DIFFICULTY LEVEL: ${difficulty}
${difficulty === 'easy' ? '- Focus on basic facts, definitions, simple recall' : ''}
${difficulty === 'medium' ? '- Focus on understanding concepts, relationships, application' : ''}
${difficulty === 'hard' ? '- Focus on analysis, synthesis, complex scenarios, clinical reasoning' : ''}

Topic content:
${topic.content?.ru || topic.description?.ru || 'General anatomy and massage therapy'}

Provide questions in JSON format:
{
  "questions": [
    {
      "question_ru": "Russian question text",
      "question_ro": "Romanian question text",
      "options_ru": ["option 1", "option 2", "option 3", "option 4"],
      "options_ro": ["option 1", "option 2", "option 3", "option 4"],
      "correctAnswer": 0,
      "explanation_ru": "Why this answer is correct (Russian)",
      "explanation_ro": "Why this answer is correct (Romanian)",
      "difficulty": "${difficulty}",
      "points": ${difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15}
    }
  ]
}

Requirements:
- Questions test ${difficulty} level understanding
- Distractors (wrong answers) should be plausible
- Cover different aspects of the topic
- Include practical application questions
- Explanations should be educational
- IMPORTANT: Use only regular ASCII quotes (") in JSON, NOT typographic quotes („" «» "")
- Make questions unique and diverse

Return ONLY valid JSON, no additional text.`

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    if (response.stop_reason === 'max_tokens') {
      console.warn(`Question batch ${i+1} was truncated, generated questions may be incomplete`)
    }

    const generatedData = parseClaudeJSON(content.text)
    allQuestions.push(...generatedData.questions)

    console.log(`Generated ${generatedData.questions.length} ${difficulty} questions (batch ${i+1}/${batches})`)
  }

  return allQuestions
}

/**
 * Generate quiz questions using Claude AI with difficulty distribution
 * Default: 150 questions (60 easy, 60 medium, 30 hard)
 */
export async function generateQuizQuestions(params: GenerateQuizParams) {
  const { topicId, questionCount = 150 } = params

  const topic = await Topic.findById(topicId).populate('categoryId')
  if (!topic) {
    throw new Error('Topic not found')
  }

  // Calculate distribution: 40% easy, 40% medium, 20% hard
  const easyCount = Math.floor(questionCount * 0.4)
  const mediumCount = Math.floor(questionCount * 0.4)
  const hardCount = questionCount - easyCount - mediumCount

  console.log(`Generating ${questionCount} questions: ${easyCount} easy, ${mediumCount} medium, ${hardCount} hard`)

  // Generate questions in batches by difficulty
  const allQuestions: any[] = []

  // Generate easy questions
  if (easyCount > 0) {
    const easyQuestions = await generateQuestionBatch(topic, easyCount, 'easy')
    allQuestions.push(...easyQuestions)
  }

  // Generate medium questions
  if (mediumCount > 0) {
    const mediumQuestions = await generateQuestionBatch(topic, mediumCount, 'medium')
    allQuestions.push(...mediumQuestions)
  }

  // Generate hard questions
  if (hardCount > 0) {
    const hardQuestions = await generateQuestionBatch(topic, hardCount, 'hard')
    allQuestions.push(...hardQuestions)
  }

  // Generate slug from topic name
  const slug = topic.name.ru
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-quiz-' + Date.now()

  // Return the quiz data with all generated questions
  return {
    title: {
      ru: `Тест: ${topic.name.ru}`,
      ro: `Test: ${topic.name.ro}`,
    },
    description: {
      ru: `Проверочный тест по теме "${topic.name.ru}"`,
      ro: `Test de verificare pentru tema "${topic.name.ro}"`,
    },
    slug,
    topicId,
    questions: allQuestions.map((q: any) => ({
      question: {
        ru: q.question_ru,
        ro: q.question_ro,
      },
      options: q.options_ru.map((opt: string, idx: number) => ({
        ru: opt,
        ro: q.options_ro[idx],
      })),
      correctAnswer: q.correctAnswer,
      explanation: {
        ru: q.explanation_ru,
        ro: q.explanation_ro,
      },
      difficulty: q.difficulty,
      points: q.points,
    })),
  }
}

/**
 * Generate massage protocol using Claude AI
 */
export async function generateMassageProtocol(params: GenerateProtocolParams) {
  const { protocolTitle, targetArea, duration = 30 } = params

  const prompt = `You are a certified massage therapy instructor.

Generate a detailed massage protocol for "${protocolTitle.ru}" (Romanian: "${protocolTitle.ro}").

Target area: ${targetArea}
Duration: ${duration} minutes

Provide the protocol in JSON format:
{
  "description_ru": "Protocol overview in Russian",
  "description_ro": "Protocol overview in Romanian",
  "indications_ru": ["indication 1", "indication 2", ...],
  "indications_ro": ["indication 1", "indication 2", ...],
  "contraindications_ru": ["contraindication 1", ...],
  "contraindications_ro": ["contraindication 1", ...],
  "steps": [
    {
      "title_ru": "Step title in Russian",
      "title_ro": "Step title in Romanian",
      "description_ru": "Detailed instructions in Russian",
      "description_ro": "Detailed instructions in Romanian",
      "duration": 5,
      "techniques_ru": ["technique 1", ...],
      "techniques_ro": ["technique 1", ...]
    }
  ],
  "tips_ru": ["tip 1", "tip 2", ...],
  "tips_ro": ["tip 1", "tip 2", ...]
}

Requirements:
- Medically accurate and safe
- Clear step-by-step instructions
- Appropriate timing for each step
- Include contraindications for safety
- Professional techniques
- Practical tips

Return ONLY valid JSON, no additional text.`

  const response = await getAnthropicClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 7000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Check if response was truncated
  if (response.stop_reason === 'max_tokens') {
    console.error('Protocol generation response was truncated due to max_tokens limit')
    throw new Error('Ответ был обрезан из-за ограничения токенов. Попробуйте уменьшить длительность или количество шагов протокола.')
  }

  const generatedProtocol = parseClaudeJSON(content.text)

  return {
    title: protocolTitle,
    description: {
      ru: generatedProtocol.description_ru,
      ro: generatedProtocol.description_ro,
    },
    targetArea: {
      ru: targetArea,
      ro: targetArea,
    },
    duration,
    difficulty: 'intermediate',
    indications: {
      ru: generatedProtocol.indications_ru,
      ro: generatedProtocol.indications_ro,
    },
    contraindications: {
      ru: generatedProtocol.contraindications_ru,
      ro: generatedProtocol.contraindications_ro,
    },
    steps: generatedProtocol.steps.map((step: any, index: number) => ({
      stepNumber: index + 1,
      title: {
        ru: step.title_ru,
        ro: step.title_ro,
      },
      description: {
        ru: step.description_ru,
        ro: step.description_ro,
      },
      duration: step.duration,
      techniques: {
        ru: step.techniques_ru,
        ro: step.techniques_ro,
      },
    })),
    tips: {
      ru: generatedProtocol.tips_ru,
      ro: generatedProtocol.tips_ro,
    },
  }
}

/**
 * Generate complete course structure
 */
export async function generateCourseStructure(courseName: string, moduleCount: number = 5) {
  const prompt = `You are a curriculum designer for anatomy and massage therapy education.

Generate a complete course structure for: "${courseName}"

Create ${moduleCount} modules (categories) with 4-6 topics each.

Return JSON:
{
  "course": {
    "name_ru": "Course name in Russian",
    "name_ro": "Course name in Romanian",
    "description_ru": "Course description",
    "description_ro": "Course description"
  },
  "modules": [
    {
      "name_ru": "Module name",
      "name_ro": "Module name",
      "description_ru": "Module description",
      "description_ro": "Module description",
      "order": 1,
      "topics": [
        {
          "name_ru": "Topic name",
          "name_ro": "Topic name",
          "estimatedTime": 45,
          "difficulty": "beginner"
        }
      ]
    }
  ]
}

Make it progressive (beginner → advanced).
Return ONLY valid JSON.`

  const response = await getAnthropicClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 10000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Check if response was truncated
  if (response.stop_reason === 'max_tokens') {
    console.error('Course structure generation response was truncated due to max_tokens limit')
    throw new Error('Ответ был обрезан из-за ограничения токенов. Попробуйте уменьшить количество модулей.')
  }

  return parseClaudeJSON(content.text)
}
