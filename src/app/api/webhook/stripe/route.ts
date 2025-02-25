import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent } from '@/modules/billing/stripe'
import { updateSubscription, getPriceByStripeId } from '@/modules/billing/service'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return new NextResponse('No signature', { status: 400 })
  }

  try {
    const event = constructWebhookEvent(body, signature)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const price = await getPriceByStripeId(subscription.items.data[0].price.id)

        if (!price) {
          console.error('Price not found:', subscription.items.data[0].price.id)
          return new NextResponse('Price not found', { status: 400 })
        }

        // Map Stripe status to our status
        const status = subscription.status as
          | 'active'
          | 'canceled'
          | 'incomplete'
          | 'incomplete_expired'
          | 'past_due'
          | 'trialing'
          | 'unpaid'

        await updateSubscription(subscription.id, {
          status,
          priceId: price.id,
          stripeCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.billing_reason === 'subscription_create') {
          // Handle first payment for new subscription
          console.log('Subscription created successfully:', invoice.subscription)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error('Payment failed for subscription:', invoice.subscription)
        // Could send an email to the customer here
        break
      }
    }

    return new NextResponse('Webhook processed', { status: 200 })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new NextResponse('Webhook error', { status: 400 })
  }
}

export const runtime = 'nodejs'
