const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const CATEGORY_ID = '6913a399b87594b3fe792e55'; // Myology category

const muscles = [
  {
    name: {
      ru: 'Грудино-ключично-сосцевидная мышца (SCM)',
      ro: 'Mușchiul sternocleidomastoidian (SCM)'
    },
    slug: 'sternocleidomastoid-scm',
    description: {
      ru: 'Одна из самых важных мышц шеи для массажиста - ключевая причина головных болей',
      ro: 'Unul dintre cei mai importanți mușchi ai gâtului pentru maseur'
    },
    categoryId: CATEGORY_ID,
    order: 2,
    content: {
      ru: '# Грудино-ключично-сосцевидная мышца\n\nПолное описание...',
      ro: 'Descriere în română...'
    }
  }
];

async function addMuscles() {
  console.log('🚀 Добавление мышц через API...\n');

  for (const muscle of muscles) {
    try {
      const response = await axios.post(`${API_URL}/topics`, muscle);
      console.log(`✅ Добавлено: ${muscle.name.ru}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⏭️  Пропуск: ${muscle.name.ru} (уже существует)`);
      } else {
        console.error(`❌ Ошибка при добавлении ${muscle.name.ru}:`, error.message);
      }
    }
  }

  console.log('\n🎉 Готово!');
}

addMuscles();
