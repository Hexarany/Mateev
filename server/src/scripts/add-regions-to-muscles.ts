import dotenv from 'dotenv'
import { connectDB } from '../config/database'
import Topic from '../models/Topic'

// ВАЖНО: Загрузить .env ПЕРЕД подключением к БД
dotenv.config()

const addRegionsToMuscles = async () => {
  try {
    await connectDB()
    console.log('\n🚀 Добавление регионов к мышцам...\n')

    // Определить маппинг: slug мышцы → регион
    const muscleToRegion: { [key: string]: { ru: string; ro: string } } = {
      // Мышцы шеи
      'sternocleidomastoid-scm': {
        ru: 'Мышцы шеи',
        ro: 'Mușchii gâtului'
      },
      'scalene-muscles': {
        ru: 'Мышцы шеи',
        ro: 'Mușchii gâtului'
      },

      // Мышцы груди и плечевого пояса
      'pectoralis-major': {
        ru: 'Мышцы груди и плечевого пояса',
        ro: 'Mușchii toracelui și centurii scapulare'
      },
      'pectoralis-minor': {
        ru: 'Мышцы груди и плечевого пояса',
        ro: 'Mușchii toracelui și centurii scapulare'
      },
      'deltoid': {
        ru: 'Мышцы груди и плечевого пояса',
        ro: 'Mușchii toracelui și centurii scapulare'
      },

      // Мышцы плеча и руки
      'supraspinatus': {
        ru: 'Мышцы плеча и руки',
        ro: 'Mușchii brațului'
      },
      'biceps-brachii': {
        ru: 'Мышцы плеча и руки',
        ro: 'Mușchii brațului'
      },
      'triceps-brachii': {
        ru: 'Мышцы плеча и руки',
        ro: 'Mușchii brațului'
      },

      // Мышцы таза и бедра
      'gluteus-maximus': {
        ru: 'Мышцы таза и бедра',
        ro: 'Mușchii pelvisului și coapsei'
      },
      'piriformis': {
        ru: 'Мышцы таза и бедра',
        ro: 'Mușchii pelvisului și coapsei'
      },
      'iliopsoas': {
        ru: 'Мышцы таза и бедра',
        ro: 'Mușchii pelvisului și coapsei'
      },
      'quadriceps-femoris': {
        ru: 'Мышцы таза и бедра',
        ro: 'Mușchii pelvisului și coapsei'
      },
      'biceps-femoris': {
        ru: 'Мышцы таза и бедра',
        ro: 'Mușchii pelvisului și coapsei'
      },

      // Мышцы голени и стопы
      'gastrocnemius': {
        ru: 'Мышцы голени и стопы',
        ro: 'Mușchii gambei și piciorului'
      },
      'soleus': {
        ru: 'Мышцы голени и стопы',
        ro: 'Mușchii gambei și piciorului'
      },

      // Жевательные мышцы
      'masseter': {
        ru: 'Жевательные мышцы и ВНЧС',
        ro: 'Mușchii masticatori și ATM'
      },
      'temporalis': {
        ru: 'Жевательные мышцы и ВНЧС',
        ro: 'Mușchii masticatori și ATM'
      }
    }

    let updated = 0
    let notFound = 0

    for (const [muscleSlug, region] of Object.entries(muscleToRegion)) {
      const result = await Topic.updateOne(
        { slug: muscleSlug },
        { $set: { region } }
      )

      if (result.modifiedCount > 0) {
        const topic = await Topic.findOne({ slug: muscleSlug })
        console.log(`✅ Обновлено: ${topic?.name.ru} → ${region.ru}`)
        updated++
      } else if (result.matchedCount > 0) {
        console.log(`⏭️  Уже имеет регион: ${muscleSlug}`)
      } else {
        console.log(`⏭️  Не найдено: ${muscleSlug}`)
        notFound++
      }
    }

    console.log(`\n🎉 Готово!`)
    console.log(`   Обновлено: ${updated}`)
    console.log(`   Не найдено: ${notFound}\n`)

    // Показать статистику по регионам
    console.log('📊 Статистика по регионам:\n')

    const uniqueRegions = Array.from(new Set(Object.values(muscleToRegion).map(r => r.ru)))

    for (const regionName of uniqueRegions) {
      const count = await Topic.countDocuments({ 'region.ru': regionName })
      console.log(`   ${regionName}: ${count} мышц`)
    }

    console.log('')
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

addRegionsToMuscles()
