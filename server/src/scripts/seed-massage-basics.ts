import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from '../models/Category'
import Topic from '../models/Topic'

dotenv.config()

async function seedMassageBasics() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Create or update the teacher-only category
    const category = await Category.findOneAndUpdate(
      { slug: 'osnovy-anatomii-dlya-massazhistov' },
      {
        name: {
          ru: 'Основы анатомии для массажистов',
          ro: 'Bazele anatomiei pentru maseuri',
        },
        description: {
          ru: 'Компактный курс основ анатомии, разработанный специально для первого урока начинающих массажистов. Оптимизирован для изучения за 3 часа.',
          ro: 'Curs compact de baze ale anatomiei, conceput special pentru prima lecție pentru maseuri începători. Optimizat pentru studiu în 3 ore.',
        },
        slug: 'osnovy-anatomii-dlya-massazhistov',
        order: -1, // Show first for teachers
        teacherOnly: true, // Only teachers and admins can see this
        icon: 'school',
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )

    console.log('✅ Category created:', category.name.ru)

    // Sample topics for massage basics
    const topics = [
      {
        name: {
          ru: 'Введение: Тело человека как система',
          ro: 'Introducere: Corpul uman ca sistem',
        },
        description: {
          ru: 'Общее представление о строении человеческого тела, основные системы и их взаимосвязь',
          ro: 'Prezentare generală a structurii corpului uman, sistemele principale și interconexiunea lor',
        },
        content: {
          ru: JSON.stringify({
            sections: [
              {
                heading: 'Основные системы организма',
                content: '• Костно-мышечная система\n• Нервная система\n• Кровеносная и лимфатическая системы\n• Кожа и подкожная клетчатка',
              },
              {
                heading: 'Анатомическое положение и плоскости',
                content: 'Стандартное анатомическое положение, основные плоскости тела (сагиттальная, фронтальная, горизонтальная)',
              },
            ],
          }),
          ro: JSON.stringify({
            sections: [
              {
                heading: 'Sistemele principale ale organismului',
                content: '• Sistemul osteo-muscular\n• Sistemul nervos\n• Sistemele circulatorii și limfatice\n• Pielea și țesutul subcutanat',
              },
            ],
          }),
        },
        categoryId: category._id,
        slug: 'vvedenie-telo-cheloveka',
        order: 1,
        difficulty: 'beginner',
        estimatedTime: 20,
      },
      {
        name: {
          ru: 'Мышечная система: Обзор основных групп мышц',
          ro: 'Sistemul muscular: Prezentarea generală a grupelor musculare principale',
        },
        description: {
          ru: 'Основные группы мышц, их локализация и функции, важные для массажа',
          ro: 'Grupele musculare principale, localizarea și funcțiile lor, importante pentru masaj',
        },
        content: {
          ru: JSON.stringify({
            sections: [
              {
                heading: 'Мышцы спины',
                content: '• Трапециевидная мышца\n• Широчайшая мышца спины\n• Выпрямители позвоночника\n• Ромбовидные мышцы',
              },
              {
                heading: 'Мышцы шеи и плечевого пояса',
                content: '• Грудино-ключично-сосцевидная мышца\n• Лестничные мышцы\n• Дельтовидная мышца',
              },
              {
                heading: 'Мышцы нижних конечностей',
                content: '• Четырехглавая мышца бедра\n• Задняя группа мышц бедра\n• Икроножная мышца\n• Камбаловидная мышца',
              },
            ],
          }),
          ro: JSON.stringify({
            sections: [
              {
                heading: 'Mușchii spatelui',
                content: '• Mușchiul trapez\n• Mușchiul latissimus dorsi\n• Erectori spinali\n• Mușchii romboidali',
              },
            ],
          }),
        },
        categoryId: category._id,
        slug: 'myshechnaya-sistema-obzor',
        order: 2,
        difficulty: 'beginner',
        estimatedTime: 30,
      },
      {
        name: {
          ru: 'Скелетная система: Кости и суставы',
          ro: 'Sistemul scheletic: Oase și articulații',
        },
        description: {
          ru: 'Основные кости и суставы, их строение и функции, ориентиры для массажа',
          ro: 'Oasele și articulațiile principale, structura și funcțiile lor, puncte de referință pentru masaj',
        },
        content: {
          ru: JSON.stringify({
            sections: [
              {
                heading: 'Позвоночник',
                content: '• Шейный отдел (7 позвонков)\n• Грудной отдел (12 позвонков)\n• Поясничный отдел (5 позвонков)\n• Крестец и копчик',
              },
              {
                heading: 'Основные суставы',
                content: '• Плечевой сустав\n• Локтевой сустав\n• Тазобедренный сустав\n• Коленный сустав\n• Голеностопный сустав',
              },
            ],
          }),
          ro: JSON.stringify({
            sections: [
              {
                heading: 'Coloana vertebrală',
                content: '• Regiunea cervicală (7 vertebre)\n• Regiunea toracică (12 vertebre)\n• Regiunea lombară (5 vertebre)\n• Sacru și coccis',
              },
            ],
          }),
        },
        categoryId: category._id,
        slug: 'skeletnaya-sistema-kosti-i-sustavy',
        order: 3,
        difficulty: 'beginner',
        estimatedTime: 25,
      },
      {
        name: {
          ru: 'Кровеносная и лимфатическая системы',
          ro: 'Sistemele circulatorii și limfatice',
        },
        description: {
          ru: 'Основы кровообращения и лимфотока, важные для понимания эффектов массажа',
          ro: 'Bazele circulației sângelui și limfei, importante pentru înțelegerea efectelor masajului',
        },
        content: {
          ru: JSON.stringify({
            sections: [
              {
                heading: 'Кровеносная система',
                content: '• Артерии и вены\n• Капилляры\n• Направление кровотока\n• Основные артерии и вены конечностей',
              },
              {
                heading: 'Лимфатическая система',
                content: '• Лимфатические сосуды\n• Лимфатические узлы\n• Направление лимфотока\n• Роль в детоксикации',
              },
            ],
          }),
          ro: JSON.stringify({
            sections: [
              {
                heading: 'Sistemul circulator',
                content: '• Artere și vene\n• Capilare\n• Direcția fluxului sanguin\n• Arterele și venele principale ale membrelor',
              },
            ],
          }),
        },
        categoryId: category._id,
        slug: 'krovenosnaya-i-limfaticheskaya-sistemy',
        order: 4,
        difficulty: 'beginner',
        estimatedTime: 20,
      },
      {
        name: {
          ru: 'Нервная система и иннервация',
          ro: 'Sistemul nervos și inervația',
        },
        description: {
          ru: 'Основы нервной системы, иннервация мышц, рефлексы',
          ro: 'Bazele sistemului nervos, inervația musculară, reflexele',
        },
        content: {
          ru: JSON.stringify({
            sections: [
              {
                heading: 'Центральная нервная система',
                content: '• Головной мозг\n• Спинной мозг\n• Нервные корешки',
              },
              {
                heading: 'Периферическая нервная система',
                content: '• Спинномозговые нервы\n• Плечевое сплетение\n• Поясничное и крестцовое сплетения\n• Основные нервы конечностей',
              },
              {
                heading: 'Вегетативная нервная система',
                content: '• Симпатическая система\n• Парасимпатическая система\n• Влияние массажа на нервную систему',
              },
            ],
          }),
          ro: JSON.stringify({
            sections: [
              {
                heading: 'Sistemul nervos central',
                content: '• Creierul\n• Măduva spinării\n• Rădăcinile nervoase',
              },
            ],
          }),
        },
        categoryId: category._id,
        slug: 'nervnaya-sistema-i-innervatsia',
        order: 5,
        difficulty: 'beginner',
        estimatedTime: 25,
      },
      {
        name: {
          ru: 'Кожа и фасции: Структура и функции',
          ro: 'Pielea și fasciile: Structură și funcții',
        },
        description: {
          ru: 'Строение кожи, подкожной клетчатки и фасций, их роль в массаже',
          ro: 'Structura pielii, țesutului subcutanat și fasciilor, rolul lor în masaj',
        },
        content: {
          ru: JSON.stringify({
            sections: [
              {
                heading: 'Строение кожи',
                content: '• Эпидермис\n• Дерма\n• Подкожная жировая клетчатка\n• Рецепторы и нервные окончания',
              },
              {
                heading: 'Фасциальная система',
                content: '• Поверхностная фасция\n• Глубокая фасция\n• Фасциальные цепи\n• Миофасциальные связи',
              },
            ],
          }),
          ro: JSON.stringify({
            sections: [
              {
                heading: 'Structura pielii',
                content: '• Epidermul\n• Dermul\n• Țesutul adipos subcutanat\n• Receptorii și terminațiile nervoase',
              },
            ],
          }),
        },
        categoryId: category._id,
        slug: 'kozha-i-fastsii',
        order: 6,
        difficulty: 'beginner',
        estimatedTime: 15,
      },
      {
        name: {
          ru: 'Триггерные точки: Введение',
          ro: 'Puncte trigger: Introducere',
        },
        description: {
          ru: 'Что такое триггерные точки, их локализация и работа с ними',
          ro: 'Ce sunt punctele trigger, localizarea lor și lucrul cu ele',
        },
        content: {
          ru: JSON.stringify({
            sections: [
              {
                heading: 'Определение триггерных точек',
                content: 'Триггерная точка - это гиперраздражимая точка в скелетной мышце, которая при пальпации вызывает боль в отдаленных областях (отраженная боль)',
              },
              {
                heading: 'Активные и латентные точки',
                content: '• Активные - вызывают постоянную боль\n• Латентные - болезненны только при надавливании',
              },
              {
                heading: 'Наиболее распространенные триггерные точки',
                content: '• Трапециевидная мышца\n• Поднимающая лопатку\n• Подзатылочные мышцы\n• Квадратная мышца поясницы',
              },
            ],
          }),
          ro: JSON.stringify({
            sections: [
              {
                heading: 'Definiția punctelor trigger',
                content: 'Un punct trigger este un punct hiperiritabil în mușchiul scheletic care cauzează durere în zone îndepărtate atunci când este palpat (durere referită)',
              },
            ],
          }),
        },
        categoryId: category._id,
        slug: 'triggernye-tochki-vvedenie',
        order: 7,
        difficulty: 'beginner',
        estimatedTime: 20,
      },
      {
        name: {
          ru: 'Противопоказания к массажу',
          ro: 'Contraindicații pentru masaj',
        },
        description: {
          ru: 'Абсолютные и относительные противопоказания, меры предосторожности',
          ro: 'Contraindicații absolute și relative, măsuri de precauție',
        },
        content: {
          ru: JSON.stringify({
            sections: [
              {
                heading: 'Абсолютные противопоказания',
                content: '• Острые инфекционные заболевания\n• Тромбоз и тромбофлебит\n• Злокачественные новообразования\n• Острые воспалительные процессы\n• Кровотечения и склонность к ним',
              },
              {
                heading: 'Относительные противопоказания',
                content: '• Беременность (1 триместр)\n• Варикозное расширение вен\n• Хронические заболевания в стадии обострения\n• Повреждения кожи в области массажа',
              },
            ],
          }),
          ro: JSON.stringify({
            sections: [
              {
                heading: 'Contraindicații absolute',
                content: '• Boli infecțioase acute\n• Tromboză și tromboflebită\n• Tumori maligne\n• Procese inflamatorii acute\n• Hemoragii și tendință la acestea',
              },
            ],
          }),
        },
        categoryId: category._id,
        slug: 'protivopokazaniya-k-massazhu',
        order: 8,
        difficulty: 'beginner',
        estimatedTime: 15,
      },
    ]

    // Create topics
    for (const topicData of topics) {
      await Topic.findOneAndUpdate(
        { slug: topicData.slug },
        topicData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      console.log('✅ Topic created:', topicData.name.ru)
    }

    console.log('\n✅ Massage basics seeding completed!')
    console.log(`📚 Created category: ${category.name.ru}`)
    console.log(`📖 Created ${topics.length} topics`)
    console.log('⏱️  Total estimated time: ~170 minutes (2h 50min)')
    console.log('🔒 Restricted access: Teachers and Admins only')

    await mongoose.connection.close()
  } catch (error) {
    console.error('❌ Error seeding massage basics:', error)
    process.exit(1)
  }
}

seedMassageBasics()
