import { sql } from 'drizzle-orm'
import { text, timestamp, pgTable, index, uuid, boolean } from 'drizzle-orm/pg-core'
import { users, accounts } from '../account/model'

export const referralCodes = pgTable(
  'referral_code',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    code: text('code').notNull(),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    userIdx: index('referral_codes_user_idx').on(table.userId),
    codeIdx: index('referral_codes_code_idx').on(table.code),
  }),
)

export const referralUses = pgTable(
  'referral_use',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    referralCodeId: uuid('referral_code_id')
      .notNull()
      .references(() => referralCodes.id),
    referredUserId: uuid('referred_user_id')
      .notNull()
      .unique()
      .references(() => users.id),
    accountId: uuid('account_id')
      .unique()
      .references(() => accounts.id),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    referralCodeIdx: index('referral_uses_code_idx').on(table.referralCodeId),
    referredUserIdx: index('referral_uses_user_idx').on(table.referredUserId),
    accountIdx: index('referral_uses_account_idx').on(table.accountId),
  }),
)

export type ReferralCode = typeof referralCodes.$inferSelect
export type NewReferralCode = typeof referralCodes.$inferInsert
export type ReferralUse = typeof referralUses.$inferSelect
export type NewReferralUse = typeof referralUses.$inferInsert
