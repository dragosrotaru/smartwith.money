import { jsonb, pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { accounts } from '@/modules/account/model'

export const housesigma = pgTable('housesigma', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  data: jsonb('data').notNull(),
})

export type HouseSigma = typeof housesigma.$inferSelect

// Junction table for many-to-many relationship between accounts and housesigma
export const accountHousesigma = pgTable(
  'account_housesigma',
  {
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    housesigmaId: text('housesigma_id')
      .notNull()
      .references(() => housesigma.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.accountId, t.housesigmaId] }),
  }),
)

// Define relations
export const housesigmaRelations = relations(housesigma, ({ many }) => ({
  accountHousesigma: many(accountHousesigma),
}))

export const accountHousesigmaRelations = relations(accountHousesigma, ({ one }) => ({
  housesigma: one(housesigma, {
    fields: [accountHousesigma.housesigmaId],
    references: [housesigma.id],
  }),
  account: one(accounts, {
    fields: [accountHousesigma.accountId],
    references: [accounts.id],
  }),
}))
