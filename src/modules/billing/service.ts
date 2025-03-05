import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscriptions, type Subscription, type NewSubscription } from './model'
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

export async function getActiveSubscription(accountId: string) {
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.accountId, accountId), eq(subscriptions.status, 'active')))
    .limit(1)
    .then((results) => results[0])

  if (!subscription) return null

  return subscription
}

export async function updateSubscription(id: string, data: Partial<NewSubscription>): Promise<Subscription> {
  const [updatedSubscription] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning()
  return updatedSubscription
}
