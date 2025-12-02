import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'
import { connectDB } from '../config/database'

dotenv.config()

// Smart name splitting function
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)

  if (parts.length === 0 || !fullName.trim()) {
    return { firstName: 'User', lastName: 'Unknown' }
  } else if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  } else {
    // First part is firstName, rest is lastName
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')
    return { firstName, lastName }
  }
}

async function migrateToTierSystem() {
  try {
    await connectDB()
    console.log('🔄 Starting migration to tier-based system...\n')

    const users = await User.find({})
    let migrated = 0
    let skipped = 0
    let upgradedToPremium = 0

    console.log(`Found ${users.length} users to process\n`)

    for (const user of users) {
      try {
        // Skip if already migrated (has firstName and lastName and accessLevel)
        if (user.firstName && user.lastName && user.accessLevel) {
          console.log(`⏭️  Skipping ${user.email} - already migrated`)
          skipped++
          continue
        }

        // Split name into firstName and lastName
        const { firstName, lastName } = splitName(user.name || user.email.split('@')[0])

        // Determine access level based on subscription status
        let accessLevel: 'free' | 'basic' | 'premium' = 'free'
        let paymentAmount = 0

        // Check if user has active or trial subscription
        if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial') {
          // Check if subscription is actually still valid
          if (user.subscriptionEndDate && user.subscriptionEndDate > new Date()) {
            // Migrate active subscribers to Premium
            accessLevel = 'premium'
            paymentAmount = 50
            upgradedToPremium++

            console.log(`✨ Upgrading ${user.email} to Premium (was ${user.subscriptionStatus})`)
          }
        }

        // Initialize paymentHistory if needed
        if (!user.paymentHistory) {
          user.paymentHistory = []
        }

        // Add payment history entry for premium users
        if (accessLevel === 'premium') {
          user.paymentHistory.push({
            amount: paymentAmount,
            fromTier: 'free',
            toTier: 'premium',
            paymentMethod: 'migration',
            date: new Date(),
          } as any)
        }

        // Update user fields
        user.firstName = firstName
        user.lastName = lastName
        user.accessLevel = accessLevel

        if (paymentAmount > 0) {
          user.paymentAmount = paymentAmount
          user.paymentDate = new Date()
        }

        await user.save({ validateBeforeSave: false })

        console.log(`✅ Migrated ${user.email}: ${firstName} ${lastName} -> ${accessLevel}`)
        migrated++
      } catch (error: any) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Migration Summary:')
    console.log('='.repeat(60))
    console.log(`Total users found:           ${users.length}`)
    console.log(`Successfully migrated:       ${migrated}`)
    console.log(`Upgraded to Premium:         ${upgradedToPremium}`)
    console.log(`Skipped (already migrated):  ${skipped}`)
    console.log('='.repeat(60))
    console.log('\n✅ Migration complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await mongoose.disconnect()
  }
}

// Run migration
migrateToTierSystem().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
