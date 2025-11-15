import dotenv from 'dotenv'
import { connectDB } from '../config/database'
import User from '../models/User'
import bcrypt from 'bcryptjs'

dotenv.config()

const createAdmin = async () => {
  try {
    await connectDB()

    const email = 'admin@anatomia.com'
    const password = 'admin123'
    const name = 'Admin'

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email })

    if (existingAdmin) {
      console.log('✅ Админ уже существует!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email:', email)
      console.log('🔑 Пароль:', password)
      console.log('👤 Имя:', existingAdmin.name)
      console.log('🎭 Роль:', existingAdmin.role)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    })

    console.log('✅ Админ успешно создан!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', email)
    console.log('🔑 Пароль:', password)
    console.log('👤 Имя:', admin.name)
    console.log('🎭 Роль:', admin.role)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('Теперь можете войти на http://localhost:5179/login')

    process.exit(0)
  } catch (error) {
    console.error('Ошибка создания админа:', error)
    process.exit(1)
  }
}

createAdmin()
