import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { prices, subscriptions, type Price, type Subscription, type NewSubscription } from './model'

export async function getActiveSubscription(userId: string): Promise<(Subscription & { price: Price }) | null> {
  const results = await db
    .select({
      subscription: subscriptions,
      price: prices,
    })
    .from(subscriptions)
    .leftJoin(prices, eq(subscriptions.priceId, prices.id))
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
    .limit(1)

  if (!results.length) return null

  const { subscription, price } = results[0]
  if (!price) return null

  return { ...subscription, price }
}

export async function getSubscriptionWithPrice(
  subscriptionId: string,
): Promise<(Subscription & { price: Price }) | null> {
  const results = await db
    .select({
      subscription: subscriptions,
      price: prices,
    })
    .from(subscriptions)
    .leftJoin(prices, eq(subscriptions.priceId, prices.id))
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1)

  if (!results.length || !results[0].price) return null

  const { subscription, price } = results[0]
  return { ...subscription, price }
}

export async function createSubscription(subscription: NewSubscription): Promise<Subscription> {
  const [newSubscription] = await db.insert(subscriptions).values(subscription).returning()
  return newSubscription
}

export async function updateSubscription(id: string, data: Partial<NewSubscription>): Promise<Subscription> {
  const [updatedSubscription] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning()
  return updatedSubscription
}

export async function getActivePrices(): Promise<Price[]> {
  return db.select().from(prices).where(eq(prices.active, true))
}

export async function getPriceByStripeId(stripeId: string): Promise<Price | null> {
  const results = await db.select().from(prices).where(eq(prices.stripeId, stripeId)).limit(1)
  return results[0] || null
}

export async function createPrice(price: Price): Promise<Price> {
  const [newPrice] = await db.insert(prices).values(price).returning()
  return newPrice
}

export async function updatePrice(id: string, data: Partial<Price>): Promise<Price> {
  const [updatedPrice] = await db
    .update(prices)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(prices.id, id))
    .returning()
  return updatedPrice
}

export async function deactivatePrice(id: string): Promise<Price> {
  return updatePrice(id, { active: false })
}

export async function getPrices() {
  const allPrices = await db.select().from(prices)
  return allPrices.map((price) => ({
    id: price.id,
    name: price.name,
    description: price.description,
    amount: price.amount,
    features: price.features || [],
  }))
}
