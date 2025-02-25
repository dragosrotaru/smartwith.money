import 'dotenv/config'
import { seedBlog } from '@/modules/blog/seed'

async function main() {
  try {
    await seedBlog()
    console.log('✅ Blog seeding completed successfully')
  } catch (error) {
    console.error('Error seeding blog data:', error)
    process.exit(1)
  }
}

main()
