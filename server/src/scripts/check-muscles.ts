import dotenv from 'dotenv'
import { connectDB } from '../config/database'
import Topic from '../models/Topic'

// Загрузить .env файл
dotenv.config()

const checkMuscles = async () => {
  try {
    await connectDB()

    const myologyId = '6913a399b87594b3fe792e55'
    const topics = await Topic.find({ categoryId: myologyId })

    console.log('\n=== МЫШЦЫ В БАЗЕ ДАННЫХ ===\n')
    console.log(`Всего тем в категории "Миология": ${topics.length}\n`)

    topics.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic.name.ru}`)
      console.log(`   Slug: ${topic.slug}`)
      console.log(`   Order: ${topic.order}`)
      console.log('')
    })

    process.exit(0)
  } catch (error) {
    console.error('Ошибка:', error)
    process.exit(1)
  }
}

checkMuscles()
