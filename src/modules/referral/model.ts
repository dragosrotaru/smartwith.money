import { sql } from 'drizzle-orm'
import { text, timestamp, pgTable, index, uuid, boolean } from 'drizzle-orm/pg-core'

export const referralCodes = pgTable(
  'referral_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
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
  'referral_uses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    referralCodeId: uuid('referral_code_id')
      .notNull()
      .references(() => referralCodes.id),
    referredUserId: uuid('referred_user_id').notNull(),
    completedAt: timestamp('completed_at').notNull().defaultNow(),
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
  }),
)

export type ReferralCode = typeof referralCodes.$inferSelect
export type NewReferralCode = typeof referralCodes.$inferInsert
export type ReferralUse = typeof referralUses.$inferSelect
export type NewReferralUse = typeof referralUses.$inferInsert
