import dotenv from 'dotenv'
import { connectDB } from '../config/database'
import Category from '../models/Category'

// ВАЖНО: Загрузить .env ПЕРЕД подключением к БД
dotenv.config()

const deleteRegionalCategories = async () => {
  try {
    await connectDB()
    console.log('\n🚀 Удаление региональных категорий...\n')

    // Список slug категорий для удаления
    const categorySlugs = [
      'neck-muscles',
      'chest-shoulder-muscles',
      'arm-muscles',
      'hip-thigh-muscles',
      'leg-foot-muscles',
      'jaw-muscles'
    ]

    let deleted = 0

    for (const slug of categorySlugs) {
      const result = await Category.deleteOne({ slug })

      if (result.deletedCount > 0) {
        console.log(`✅ Удалено: ${slug}`)
        deleted++
      } else {
        console.log(`⏭️  Не найдено: ${slug}`)
      }
    }

    console.log(`\n🎉 Готово! Удалено категорий: ${deleted}\n`)

    // Показать оставшиеся категории
    const remaining = await Category.find().sort({ order: 1 })
    console.log('📊 Оставшиеся категории:\n')
    remaining.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name.ru} (${cat.slug})`)
    })
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

deleteRegionalCategories()
