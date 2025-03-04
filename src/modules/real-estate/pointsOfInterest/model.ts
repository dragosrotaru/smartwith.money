import { pgTable, text, numeric, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { accounts } from '@/modules/account/model'

export const pointsOfInterest = pgTable('real_estate_point_of_interest', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id),
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
