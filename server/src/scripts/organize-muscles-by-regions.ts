import dotenv from 'dotenv'
import { connectDB } from '../config/database'
import Category from '../models/Category'
import Topic from '../models/Topic'

// ВАЖНО: Загрузить .env ПЕРЕД подключением к БД
dotenv.config()

const organizeMusclesByRegions = async () => {
  try {
    await connectDB()
    console.log('\n🚀 Начинаем реорганизацию мышц по регионам...\n')

    // Определить новые категории по анатомическим регионам
    const muscleCategories = [
      {
        name: {
          ru: 'Мышцы шеи',
          ro: 'Mușchii gâtului'
        },
        description: {
          ru: 'Анатомия и массаж мышц шейной области',
          ro: 'Anatomia și masajul mușchilor regiunii cervicale'
        },
        slug: 'neck-muscles',
        icon: '🦴',
        order: 10
      },
      {
        name: {
          ru: 'Мышцы груди и плечевого пояса',
          ro: 'Mușchii toracelui și centurii scapulare'
        },
        description: {
          ru: 'Большая грудная, дельтовидная и мышцы плечевого пояса',
          ro: 'Mușchiul pectoral mare, deltoid și mușchii centurii scapulare'
        },
        slug: 'chest-shoulder-muscles',
        icon: '💪',
        order: 11
      },
      {
        name: {
          ru: 'Мышцы плеча и руки',
          ro: 'Mușchii brațului'
        },
        description: {
          ru: 'Вращательная манжета, бицепс, трицепс и мышцы предплечья',
          ro: 'Manșeta rotatorilor, biceps, triceps și mușchii antebrațului'
        },
        slug: 'arm-muscles',
        icon: '💪',
        order: 12
      },
      {
        name: {
          ru: 'Мышцы таза и бедра',
          ro: 'Mușchii pelvisului și coapsei'
        },
        description: {
          ru: 'Ягодичные, грушевидная, подвздошно-поясничная и мышцы бедра',
          ro: 'Mușchii gluteali, piriform, iliopsoas și mușchii coapsei'
        },
        slug: 'hip-thigh-muscles',
        icon: '🦵',
        order: 13
      },
      {
        name: {
          ru: 'Мышцы голени и стопы',
          ro: 'Mușchii gambei și piciorului'
        },
        description: {
          ru: 'Икроножная, камбаловидная и мышцы стопы',
          ro: 'Gastrocnemian, soleu și mușchii piciorului'
        },
        slug: 'leg-foot-muscles',
        icon: '🦶',
        order: 14
      },
      {
        name: {
          ru: 'Жевательные мышцы и ВНЧС',
          ro: 'Mușchii masticatori și ATM'
        },
        description: {
          ru: 'Жевательная, височная мышцы и работа с ВНЧС',
          ro: 'Mușchiul maseter, temporal și lucrul cu ATM'
        },
        slug: 'jaw-muscles',
        icon: '😬',
        order: 15
      }
    ]

    // Создать категории
    const categoryMap: { [key: string]: string } = {}

    for (const catData of muscleCategories) {
      let category = await Category.findOne({ slug: catData.slug })

      if (!category) {
        category = await Category.create(catData)
        console.log(`✅ Создана категория: ${catData.name.ru}`)
      } else {
        console.log(`⏭️  Категория уже существует: ${catData.name.ru}`)
      }

      categoryMap[catData.slug] = (category._id as any).toString()
    }

    console.log('\n📝 Реорганизация мышц по категориям...\n')

    // Определить маппинг: slug мышцы → slug категории
    const muscleToCategory: { [key: string]: string } = {
      // Мышцы шеи
      'sternocleidomastoid-scm': 'neck-muscles',
      'scalene-muscles': 'neck-muscles',

      // Мышцы груди и плечевого пояса
      'pectoralis-major': 'chest-shoulder-muscles',
      'pectoralis-minor': 'chest-shoulder-muscles',
      'deltoid': 'chest-shoulder-muscles',

      // Мышцы плеча и руки
      'supraspinatus': 'arm-muscles',
      'biceps-brachii': 'arm-muscles',
      'triceps-brachii': 'arm-muscles',

      // Мышцы таза и бедра
      'gluteus-maximus': 'hip-thigh-muscles',
      'piriformis': 'hip-thigh-muscles',
      'iliopsoas': 'hip-thigh-muscles',
      'quadriceps-femoris': 'hip-thigh-muscles',
      'biceps-femoris': 'hip-thigh-muscles',

      // Мышцы голени
      'gastrocnemius': 'leg-foot-muscles',
      'soleus': 'leg-foot-muscles',

      // Жевательные мышцы
      'masseter': 'jaw-muscles',
      'temporalis': 'jaw-muscles'
    }

    // Обновить categoryId для каждой мышцы
    for (const [muscleSlug, categorySlug] of Object.entries(muscleToCategory)) {
      const newCategoryId = categoryMap[categorySlug]

      const result = await Topic.updateOne(
        { slug: muscleSlug },
        { $set: { categoryId: newCategoryId } }
      )

      if (result.modifiedCount > 0) {
        const topic = await Topic.findOne({ slug: muscleSlug })
        console.log(`✅ Перенесено: ${topic?.name.ru} → ${categorySlug}`)
      } else {
        console.log(`⏭️  Пропуск: ${muscleSlug} (не найдено или уже в нужной категории)`)
      }
    }

    console.log('\n🎉 Реорганизация завершена!\n')

    // Показать статистику по категориям
    console.log('📊 Статистика по категориям:\n')

    for (const catData of muscleCategories) {
      const categoryId = categoryMap[catData.slug]
      const count = await Topic.countDocuments({ categoryId })
      console.log(`   ${catData.icon} ${catData.name.ru}: ${count} тем`)
    }

    console.log('')
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

organizeMusclesByRegions()
