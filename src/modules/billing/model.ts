import { sql } from 'drizzle-orm'
import { text, timestamp, pgTable, pgEnum, index, uuid, boolean } from 'drizzle-orm/pg-core'
import { accounts } from '../account/model'
import Stripe from 'stripe'

// Enums
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
  'paused',
] as const satisfies Stripe.Subscription.Status[])
export type SubscriptionStatus = Stripe.Subscription.Status

export const subscriptions = pgTable(
  'stripe_subscription',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id),
    stripeId: text('stripe_id').notNull().unique(),
    stripeCustomerId: text('stripe_customer_id').notNull(),
    stripeCurrentPeriodStart: timestamp('stripe_current_period_start').notNull(),
    stripeCurrentPeriodEnd: timestamp('stripe_current_period_end').notNull(),
    status: subscriptionStatusEnum('status').notNull(),
    stripePriceId: text('stripe_price_id').notNull(),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    canceledAt: timestamp('canceled_at'),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    accountIdIdx: index('subscriptions_account_id_idx').on(table.accountId),
    stripeIdIdx: index('subscriptions_stripe_id_idx').on(table.stripeId),
    statusIdx: index('subscriptions_status_idx').on(table.status),
  }),
)
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
