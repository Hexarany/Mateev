import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from '../models/Category'
import Topic from '../models/Topic'
import Quiz from '../models/Quiz'
import { generateQuizQuestions } from '../services/contentGenerator'

dotenv.config()

async function regenerateQuizzes() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Find the massage basics category
    const category = await Category.findOne({ slug: 'osnovy-anatomii-dlya-massazhistov' })
    if (!category) {
      console.error('❌ Category "Основы анатомии для массажистов" not found')
      process.exit(1)
    }

    console.log(`📚 Found category: ${category.name.ru}`)

    // Find all topics in this category
    const topics = await Topic.find({ categoryId: category._id })
    console.log(`📖 Found ${topics.length} topics`)

    // Delete all existing quizzes for these topics
    const topicIds = topics.map(t => t._id)
    const deleteResult = await Quiz.deleteMany({ topicId: { $in: topicIds } })
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old quizzes`)

    // Generate new quizzes with 150 questions for each topic
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      console.log(`\n📝 [${i + 1}/${topics.length}] Generating quiz for: ${topic.name.ru}`)
      console.log(`   This will take a few minutes (generating 150 questions)...`)

      try {
        const quizData = await generateQuizQuestions({
          topicId: topic._id.toString(),
          questionCount: 150, // Generate 150 questions (60 easy, 60 medium, 30 hard)
        })

        const quiz = new Quiz({
          ...quizData,
          categoryId: category._id,
        })

        await quiz.save()
        console.log(`   ✅ Generated ${quiz.questions.length} questions`)

        // Count questions by difficulty
        const easyCount = quiz.questions.filter((q: any) => q.difficulty === 'easy').length
        const mediumCount = quiz.questions.filter((q: any) => q.difficulty === 'medium').length
        const hardCount = quiz.questions.filter((q: any) => q.difficulty === 'hard').length

        console.log(`   📊 Distribution: ${easyCount} easy, ${mediumCount} medium, ${hardCount} hard`)
        successCount++
      } catch (error: any) {
        console.error(`   ❌ Failed to generate quiz: ${error.message}`)
        failCount++
      }
    }

    console.log(`\n✅ Quiz regeneration complete!`)
    console.log(`   Success: ${successCount}/${topics.length}`)
    if (failCount > 0) {
      console.log(`   Failed: ${failCount}/${topics.length}`)
    }

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

regenerateQuizzes()
