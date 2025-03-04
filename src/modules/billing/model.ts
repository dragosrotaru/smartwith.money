import { sql } from 'drizzle-orm'
import { text, timestamp, pgTable, pgEnum, index, uuid, boolean, integer } from 'drizzle-orm/pg-core'
import { accounts } from '../account/model'

// Enums
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
])

export const planTypeEnum = pgEnum('plan_type', ['free', 'pro'])

// Tables
export const prices = pgTable(
  'stripe_price',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stripeId: text('stripe_id').notNull().unique(),
    type: planTypeEnum('type').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    amount: integer('amount').notNull(), // in cents
    currency: text('currency').notNull().default('cad'),
    interval: text('interval').notNull(), // month, year
    active: boolean('active').notNull().default(true),
    features: text('features').array(), // JSON array of features
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    stripeIdIdx: index('prices_stripe_id_idx').on(table.stripeId),
    typeIdx: index('prices_type_idx').on(table.type),
  }),
)

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
    priceId: uuid('price_id')
      .references(() => prices.id)
      .notNull(),
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

// Types
export type Price = typeof prices.$inferSelect
export type NewPrice = typeof prices.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
