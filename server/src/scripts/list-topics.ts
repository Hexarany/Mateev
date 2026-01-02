import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Topic from '../models/Topic'
import Quiz from '../models/Quiz'

dotenv.config()

async function listTopics() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    // Get all topics
    const topics = await Topic.find().populate('categoryId').sort({ 'categoryId.order': 1, order: 1 })

    console.log(`📚 Found ${topics.length} topics:\n`)

    let currentCategory = ''

    for (const topic of topics) {
      const categoryName = topic.categoryId?.name?.ru || 'Unknown Category'

      // Print category header if it changed
      if (categoryName !== currentCategory) {
        currentCategory = categoryName
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
        console.log(`📂 ${categoryName}`)
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      }

      // Check if quiz exists
      const quiz = await Quiz.findOne({ topicId: topic._id })
      const quizInfo = quiz
        ? `✅ Quiz exists (${quiz.questions.length} questions)`
        : '❌ No quiz'

      console.log(`\n📖 ${topic.name.ru}`)
      console.log(`   Slug: ${topic.slug}`)
      console.log(`   ID: ${topic._id}`)
      console.log(`   ${quizInfo}`)
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
    console.log('💡 To generate quiz for a topic, use:')
    console.log('   npx ts-node src/scripts/generate-quiz-by-topic.ts <topic-slug>\n')

    await mongoose.connection.close()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

listTopics()
