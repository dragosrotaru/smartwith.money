import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { accounts, users } from '../account/model'

export const FEEDBACK_ACTIVITIES = ['account_deletion'] as const
export type FeedbackActivity = (typeof FEEDBACK_ACTIVITIES)[number]

export const feedback = pgTable('account_feedback', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id),
  activity: text('activity', { enum: FEEDBACK_ACTIVITIES }).$type<FeedbackActivity>().notNull(),
  reason: text('reason').notNull(),
  improvementSuggestions: text('improvement_suggestions'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
