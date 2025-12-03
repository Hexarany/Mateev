import mongoose from 'mongoose'
import dotenv from 'dotenv'
import MassageProtocol from '../models/MassageProtocol'

dotenv.config()

async function checkSlugs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('✅ Connected to MongoDB')

    const protocols = await MassageProtocol.find({}, 'slug name')
    console.log('\n📋 Current massage protocol slugs:')
    protocols.forEach(p => {
      console.log(`  - ${p.slug} | ${p.name.ru}`)
    })

    await mongoose.disconnect()
    console.log('\n✅ Done')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkSlugs()
