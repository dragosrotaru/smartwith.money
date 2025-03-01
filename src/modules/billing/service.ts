import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { prices, subscriptions, type Price, type Subscription, type NewSubscription } from './model'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is required')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
})

export async function createCustomer(params: { email: string; name?: string }) {
  return stripe.customers.create({
    email: params.email,
    name: params.name,
  })
}

export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      trial_period_days: 14,
    },
  })
}

export async function createBillingPortalSession(params: { customerId: string; returnUrl: string }) {
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}

export async function getActiveSubscription(accountId: string): Promise<(Subscription & { price: Price }) | null> {
  const results = await db
    .select({
      subscription: subscriptions,
      price: prices,
    })
    .from(subscriptions)
    .leftJoin(prices, eq(subscriptions.priceId, prices.id))
    .where(and(eq(subscriptions.accountId, accountId), eq(subscriptions.status, 'active')))
    .limit(1)

  if (!results.length) return null

  const { subscription, price } = results[0]
  if (!price) return null

  return { ...subscription, price }
}

export async function updateSubscription(id: string, data: Partial<NewSubscription>): Promise<Subscription> {
  const [updatedSubscription] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning()
  return updatedSubscription
}

export async function getPriceByStripeId(stripeId: string): Promise<Price | null> {
  const results = await db.select().from(prices).where(eq(prices.stripeId, stripeId)).limit(1)
  return results[0] || null
}
