import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { accounts, users } from '../account/model'

export const FEEDBACK_ACTIVITIES = ['account_deletion'] as const
export type FeedbackActivity = (typeof FEEDBACK_ACTIVITIES)[number]

export const feedback = pgTable('account_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id),
  activity: text('activity', { enum: FEEDBACK_ACTIVITIES }).$type<FeedbackActivity>().notNull(),
  reason: text('reason').notNull(),
  improvementSuggestions: text('improvement_suggestions'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
