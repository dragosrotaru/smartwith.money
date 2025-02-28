'use server'

import { auth } from '@/auth'
import {
  createBillingPortalSession,
  createCustomer,
  createCheckoutSession as createStripeCheckoutSession,
} from '@/modules/billing/stripe'
import { getActiveSubscription } from './service'
import { updateUserStripeCustomerId } from '@/modules/account/repo'

export async function createPortalSession() {
  try {
    const session = await auth()
    if (!session?.user?.stripeCustomerId) {
      throw new Error('Unauthorized')
    }

    const portalSession = await createBillingPortalSession({
      customerId: session.user.stripeCustomerId,
      returnUrl: `${process.env.APP_URL}/user`,
    })

    return { url: portalSession.url }
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    throw new Error('Failed to create billing portal session')
  }
}

export async function getSubscriptionStatus() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { isProMember: false }
    }

    const subscription = await getActiveSubscription(session.user.id)
    return {
      isProMember: !!subscription && subscription.price.type === 'pro',
    }
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return { isProMember: false }
  }
}

export async function createCheckoutSession(): Promise<{ url: string }> {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    // Check if user already has an active subscription
    const subscription = await getActiveSubscription(session.user.id)
    if (subscription) {
      throw new Error('User already has an active subscription')
    }

    // Create or get Stripe customer
    let customerId = session.user.stripeCustomerId
    if (!customerId) {
      const customer = await createCustomer({
        email: session.user.email!,
        name: session.user.name || undefined,
      })
      customerId = customer.id

      // Save customer ID to user record
      await updateUserStripeCustomerId(session.user.id, customerId)
    }

    // Create Stripe checkout session with referral code in success URL if provided
    const successUrl = new URL(`${process.env.APP_URL}/user`)
    successUrl.searchParams.set('subscription', 'success')

    const checkoutSession = await createStripeCheckoutSession({
      customerId,
      priceId: process.env.STRIPE_PRO_PRICE_ID!,
      successUrl: successUrl.toString(),
      cancelUrl: `${process.env.APP_URL}/user?subscription=cancelled`,
    })

    if (!checkoutSession.url) {
      throw new Error('Failed to create checkout session URL')
    }

    return { url: checkoutSession.url }
  } catch (error) {
    console.error('Error in checkout:', error)
    throw new Error('Failed to create checkout session')
  }
}
