import 'dotenv/config'
import { seedFeeds } from '@/modules/feeds/seed'

async function main() {
  try {
    await seedFeeds()
    console.log('✅ Feed seeding completed successfully')
  } catch (error) {
    console.error('Error seeding feeds:', error)
    process.exit(1)
  }
}

main()
