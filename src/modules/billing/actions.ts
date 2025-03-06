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
import { menu } from '@/lib/menu'

export async function createPortalSession() {
  try {
    const auth = await withOwnerAccess()
    if (auth instanceof Error) throw new Error('Unauthorized')

    // Get account
    const [account] = await db.select().from(accounts).where(eq(accounts.id, auth.activeAccountId)).limit(1)
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

export async function getSubscriptionStatus() {
  try {
    const auth = await withOwnerAccess()
    if (auth instanceof Error) return { isProMember: false, status: null, trialEndsAt: null }

    const subscription = await getActiveSubscription(auth.activeAccountId)
    const isProMember = !!subscription && subscription.status !== 'canceled' && subscription.status !== 'paused'
    return {
      isProMember,
      status: subscription?.status || null,
      trialEndsAt: subscription?.stripeCurrentPeriodEnd || null,
    }
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return { isProMember: false, status: null, trialEndsAt: null }
  }
}

export async function createCheckoutSession(): Promise<{ url: string }> {
  try {
    const auth = await withOwnerAccess()
    if (auth instanceof Error) throw new Error('Unauthorized')

    // Get account
    const [account] = await db.select().from(accounts).where(eq(accounts.id, auth.activeAccountId)).limit(1)
    if (!account?.stripeCustomerId) throw new Error('No billing account found')

    // Check if account already has an active subscription
    const subscription = await getActiveSubscription(auth.activeAccountId)
    if (subscription) throw new Error('Account already has an active subscription')

    // Create Stripe checkout session
    const successUrl = `${process.env.APP_URL}${menu.account.href}?subscription=success`

    const checkoutSession = await createStripeCheckoutSession({
      customerId: account.stripeCustomerId,
      priceId: process.env.STRIPE_PRO_PRICE_ID!,
      successUrl,
    })

    if (!checkoutSession.url) throw new Error('Failed to create checkout session URL')

    return { url: checkoutSession.url }
  } catch (error) {
    console.error('Error in checkout:', error)
    throw new Error('Failed to create checkout session')
  }
}
