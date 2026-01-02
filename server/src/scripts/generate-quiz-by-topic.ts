import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Topic from '../models/Topic'
import Quiz from '../models/Quiz'
import { generateQuizQuestions } from '../services/contentGenerator'

dotenv.config()

async function generateQuizByTopic() {
  try {
    // Get topic slug or ID from command line
    const topicIdentifier = process.argv[2]

    if (!topicIdentifier) {
      console.error('❌ Please provide a topic slug or ID')
      console.log('\nUsage:')
      console.log('  npx ts-node src/scripts/generate-quiz-by-topic.ts <topic-slug-or-id>')
      console.log('\nExamples:')
      console.log('  npx ts-node src/scripts/generate-quiz-by-topic.ts sustavy')
      console.log('  npx ts-node src/scripts/generate-quiz-by-topic.ts 507f1f77bcf86cd799439011')
      process.exit(1)
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Find topic by slug or ID
    let topic
    if (mongoose.Types.ObjectId.isValid(topicIdentifier)) {
      topic = await Topic.findById(topicIdentifier).populate('categoryId')
    } else {
      topic = await Topic.findOne({ slug: topicIdentifier }).populate('categoryId')
    }

    if (!topic) {
      console.error(`❌ Topic not found: ${topicIdentifier}`)
      process.exit(1)
    }

    console.log(`\n📖 Found topic: ${topic.name.ru}`)
    console.log(`📚 Category: ${topic.categoryId?.name?.ru || 'Unknown'}`)

    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ topicId: topic._id })
    if (existingQuiz) {
      console.log(`\n⚠️  Quiz already exists with ${existingQuiz.questions.length} questions`)
      console.log('   Deleting old quiz...')
      await Quiz.deleteOne({ _id: existingQuiz._id })
      console.log('   ✅ Old quiz deleted')
    }

    // Generate new quiz with 150 questions
    console.log(`\n📝 Generating quiz with 150 questions...`)
    console.log(`   This will take a few minutes...`)

    const quizData = await generateQuizQuestions({
      topicId: topic._id.toString(),
      questionCount: 150, // Generate 150 questions (60 easy, 60 medium, 30 hard)
    })

    const quiz = new Quiz({
      ...quizData,
      categoryId: topic.categoryId?._id,
    })

    await quiz.save()

    // Count questions by difficulty
    const easyCount = quiz.questions.filter((q: any) => q.difficulty === 'easy').length
    const mediumCount = quiz.questions.filter((q: any) => q.difficulty === 'medium').length
    const hardCount = quiz.questions.filter((q: any) => q.difficulty === 'hard').length

    console.log(`\n✅ Quiz generated successfully!`)
    console.log(`   Total questions: ${quiz.questions.length}`)
    console.log(`   📊 Distribution:`)
    console.log(`      🟢 Easy: ${easyCount} questions (${((easyCount/quiz.questions.length)*100).toFixed(0)}%)`)
    console.log(`      🟡 Medium: ${mediumCount} questions (${((mediumCount/quiz.questions.length)*100).toFixed(0)}%)`)
    console.log(`      🔴 Hard: ${hardCount} questions (${((hardCount/quiz.questions.length)*100).toFixed(0)}%)`)
    console.log(`\n   Quiz slug: ${quiz.slug}`)
    console.log(`   Quiz ID: ${quiz._id}`)

    await mongoose.connection.close()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

generateQuizByTopic()
