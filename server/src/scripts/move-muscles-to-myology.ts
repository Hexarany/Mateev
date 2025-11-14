import dotenv from 'dotenv'
import { connectDB } from '../config/database'
import Category from '../models/Category'
import Topic from '../models/Topic'

// ВАЖНО: Загрузить .env ПЕРЕД подключением к БД
dotenv.config()

const moveMusclesToMyology = async () => {
  try {
    await connectDB()
    console.log('\n🚀 Перемещение всех мышц в категорию "Миология"...\n')

    // Найти категорию "Миология"
    const myologyCategory = await Category.findOne({ slug: 'myology' })

    if (!myologyCategory) {
      throw new Error('Категория "Миология" не найдена!')
    }

    const myologyId = (myologyCategory._id as any).toString()
    console.log(`📂 ID категории "Миология": ${myologyId}\n`)

    // Список всех мышц по slug
    const musclesSlugs = [
      'sternocleidomastoid-scm',
      'scalene-muscles',
      'pectoralis-major',
      'pectoralis-minor',
      'deltoid',
      'supraspinatus',
      'biceps-brachii',
      'triceps-brachii',
      'gluteus-maximus',
      'piriformis',
      'iliopsoas',
      'quadriceps-femoris',
      'biceps-femoris',
      'gastrocnemius',
      'soleus',
      'masseter',
      'temporalis'
    ]

    console.log('📝 Перемещение мышц...\n')

    let moved = 0
    let notFound = 0

    for (const slug of musclesSlugs) {
      const result = await Topic.updateOne(
        { slug },
        { $set: { categoryId: myologyId } }
      )

      if (result.matchedCount > 0) {
        const topic = await Topic.findOne({ slug })
        console.log(`✅ Перемещено: ${topic?.name.ru}`)
        moved++
      } else {
        console.log(`⏭️  Не найдено: ${slug}`)
        notFound++
      }
    }

    console.log(`\n🎉 Готово!`)
    console.log(`   Перемещено: ${moved}`)
    console.log(`   Не найдено: ${notFound}\n`)

    // Показать итоговую статистику
    const totalInMyology = await Topic.countDocuments({ categoryId: myologyId })
    console.log(`📊 Итого в категории "Миология": ${totalInMyology} тем\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

moveMusclesToMyology()
