import { connectDB } from '../config/database'
import User from '../models/User'

const deleteUser = async (email: string) => {
  try {
    await connectDB()

    const user = await User.findOneAndDelete({ email })

    if (user) {
      console.log(`✅ Пользователь удален:`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Имя: ${user.name}`)
    } else {
      console.log(`❌ Пользователь с email "${email}" не найден`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при удалении пользователя:', error)
    process.exit(1)
  }
}

// Получаем email из аргументов командной строки
const email = process.argv[2]

if (!email) {
  console.error('❌ Использование: npx ts-node src/scripts/delete-user.ts <email>')
  console.error('❌ Пример: npx ts-node src/scripts/delete-user.ts user@example.com')
  process.exit(1)
}

deleteUser(email)
