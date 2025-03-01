import { pgTable, text, numeric, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { accounts } from '@/modules/account/model'

export const pointsOfInterest = pgTable('points_of_interest', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  type: text('type').notNull(),
  placeId: text('place_id').notNull(),
  latitude: numeric('latitude').notNull(),
  longitude: numeric('longitude').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Define the relationships
export const pointsOfInterestRelations = relations(pointsOfInterest, ({ one }) => ({
  account: one(accounts, {
    fields: [pointsOfInterest.accountId],
    references: [accounts.id],
  }),
}))

export type PointsOfInterest = typeof pointsOfInterest.$inferSelect
