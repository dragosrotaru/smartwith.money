'use server'

import { auth } from '@/auth'
import { createBillingPortalSession } from '@/modules/billing/stripe'

export async function createPortalSession() {
  try {
    const session = await auth()
    if (!session?.user?.stripeCustomerId) {
      throw new Error('Unauthorized')
    }

    const portalSession = await createBillingPortalSession({
      customerId: session.user.stripeCustomerId,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user`,
    })

    return { url: portalSession.url }
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    throw new Error('Failed to create billing portal session')
  }
}

// Remove the old API route code since we're now using a server action
