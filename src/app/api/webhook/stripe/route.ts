import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createSubscription, updateSubscription, constructWebhookEvent } from '@/modules/billing/service'
import { db } from '@/lib/db'
import { accounts } from '@/modules/account/model'
import { eq } from 'drizzle-orm'

export async function GET() {
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return new NextResponse('No signature', { status: 400 })
  }

  return new NextResponse('Webhook endpoint is alive', { status: 200 })
}

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
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription

        // Get account by stripe customer ID
        const [account] = await db
          .select()
          .from(accounts)
          .where(eq(accounts.stripeCustomerId, subscription.customer as string))
          .limit(1)

        if (!account) {
          console.error('Account not found for customer:', subscription.customer)
          return new NextResponse('Account not found', { status: 400 })
        }

        // Add accountId to subscription metadata
        subscription.metadata.accountId = account.id
        await createSubscription(subscription)
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await updateSubscription(subscription)
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
