'use server'

import {
  createBillingPortalSession,
  createCheckoutSession as createStripeCheckoutSession,
} from '@/modules/billing/service'
import { getActiveSubscription } from './service'
import { db } from '@/lib/db'
import { accounts } from '@/modules/account/model'
import { eq } from 'drizzle-orm'
import { withOwnerAccess } from '@/modules/account/actions'

export async function createPortalSession(accountId: string) {
  try {
    const auth = await withOwnerAccess(accountId)
    if (auth instanceof Error) throw new Error('Unauthorized')

    // Get account
    const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
    if (!account?.stripeCustomerId) throw new Error('No billing account found')

    const portalSession = await createBillingPortalSession({
      customerId: account.stripeCustomerId,
      returnUrl: `${process.env.APP_URL}/account`,
    })

    return { url: portalSession.url }
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    throw new Error('Failed to create billing portal session')
  }
}

export async function getSubscriptionStatus(accountId: string) {
  try {
    const auth = await withOwnerAccess(accountId)
    if (auth instanceof Error) return { isProMember: false }

    const subscription = await getActiveSubscription(accountId)
    return {
      isProMember: !!subscription && subscription.price.type === 'pro',
    }
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return { isProMember: false }
  }
}

export async function createCheckoutSession(accountId: string): Promise<{ url: string }> {
  try {
    const auth = await withOwnerAccess(accountId)
    if (auth instanceof Error) throw new Error('Unauthorized')

    // Get account
    const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
    if (!account?.stripeCustomerId) throw new Error('No billing account found')

    // Check if account already has an active subscription
    const subscription = await getActiveSubscription(accountId)
    if (subscription) throw new Error('Account already has an active subscription')

    // Create Stripe checkout session
    const successUrl = new URL(`${process.env.APP_URL}/account`)
    successUrl.searchParams.set('subscription', 'success')

    const checkoutSession = await createStripeCheckoutSession({
      customerId: account.stripeCustomerId,
      priceId: process.env.STRIPE_PRO_PRICE_ID!,
      successUrl: successUrl.toString(),
      cancelUrl: `${process.env.APP_URL}/account?subscription=cancelled`,
    })

    if (!checkoutSession.url) throw new Error('Failed to create checkout session URL')

    return { url: checkoutSession.url }
  } catch (error) {
    console.error('Error in checkout:', error)
    throw new Error('Failed to create checkout session')
  }
}
