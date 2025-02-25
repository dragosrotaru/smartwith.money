import 'dotenv/config'
import { db } from '@/lib/db'
import { prices } from '@/modules/billing/model'

async function main() {
  console.log('🌱 Seeding prices...')

  try {
    await db.insert(prices).values([
      {
        id: 'price_free',
        stripeId: 'price_free',
        type: 'free',
        name: 'Free',
        description: 'Perfect for getting started',
        amount: 0,
        currency: 'usd',
        interval: 'month',
        active: true,
        features: [
          'Basic article generation',
          'Up to 10 articles per month',
          'Email notifications',
          'Community support',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'price_pro',
        stripeId: process.env.STRIPE_PRO_PRICE_ID!,
        type: 'pro',
        name: 'Pro',
        description: 'For power users who need more',
        amount: 1999, // $19.99
        currency: 'usd',
        interval: 'month',
        active: true,
        features: [
          'Unlimited article generation',
          'Priority article processing',
          'Custom RSS feed filters',
          'Advanced analytics',
          'Priority support',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    console.log('✅ Prices seeded successfully')
  } catch (error) {
    console.error('Error seeding prices:', error)
    process.exit(1)
  }

  process.exit(0)
}

main()
