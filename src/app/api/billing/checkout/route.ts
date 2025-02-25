import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { createCheckoutSession, createCustomer } from '@/modules/billing/stripe'
import { getActiveSubscription } from '@/modules/billing/service'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    const { priceId } = json

    if (!priceId) {
      return new NextResponse('Price ID is required', { status: 400 })
    }

    // Check if user already has an active subscription
    const subscription = await getActiveSubscription(session.user.id)
    if (subscription) {
      return new NextResponse('User already has an active subscription', { status: 400 })
    }

    // Create or get Stripe customer
    let customerId = session.user.stripeCustomerId
    if (!customerId) {
      const customer = await createCustomer({
        email: session.user.email!,
        name: session.user.name || undefined,
      })
      customerId = customer.id
      // TODO: Save customer ID to user record
    }

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error in checkout:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export const runtime = 'nodejs'
