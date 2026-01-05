import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Topic from '../models/Topic'

dotenv.config()

async function checkTopicDetail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia')

    const topic = await Topic.findOne({ slug: 'vvedenie-telo-cheloveka' })

    if (topic) {
      console.log('=== ТОПИК: Введение в тело человека ===\n')
      console.log('RU Name:', topic.name.ru)
      console.log('RO Name:', topic.name.ro)
      console.log('Время:', topic.estimatedTime, 'мин')
      console.log('Сложность:', topic.difficulty)
      console.log('\n--- ОПИСАНИЕ (RU) ---')
      console.log(topic.description.ru.substring(0, 500) + '...')
      console.log('\n--- СОДЕРЖАНИЕ (RU) ---')
      console.log('Длина:', topic.content.ru.length, 'символов')
      console.log(topic.content.ru.substring(0, 1000) + '...')
      console.log('\n--- Images:', topic.images?.length || 0)
      console.log('--- Videos:', topic.videos?.length || 0)
    } else {
      console.log('Топик не найден')
    }

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkTopicDetail()
