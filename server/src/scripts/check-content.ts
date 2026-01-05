import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Topic from '../models/Topic'
import Category from '../models/Category'

dotenv.config()

async function checkContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia')

    const categories = await Category.find().select('name slug')
    console.log('=== КАТЕГОРИИ ===')
    categories.forEach(c => console.log(`${c.slug}: ${c.name.ru} / ${c.name.ro}`))

    const topics = await Topic.find().select('name slug categoryId estimatedTime').populate('categoryId', 'name')
    console.log(`\n=== ТОПИКИ (всего: ${topics.length}) ===`)

    // Group by category
    const byCategory: any = {}
    topics.forEach(t => {
      const catName = (t.categoryId as any)?.name?.ru || 'Без категории'
      if (!byCategory[catName]) byCategory[catName] = []
      byCategory[catName].push(t)
    })

    Object.keys(byCategory).forEach(cat => {
      console.log(`\n${cat}:`)
      byCategory[cat].forEach((t: any) => {
        console.log(`  - ${t.slug} (${t.estimatedTime} мин)`)
      })
    })

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkContent()
