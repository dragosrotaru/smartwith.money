import { jsonb, pgTable, timestamp, primaryKey, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { accounts } from '@/modules/account/model'

export const housesigmaRaw = pgTable('real_estate_housesigma_raw', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  data: jsonb('data').notNull(),
})

export type HouseSigma = typeof housesigmaRaw.$inferSelect

// Junction table for many-to-many relationship between accounts and housesigma
export const houseSigma = pgTable(
  'real_estate_house_sigma',
  {
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    housesigmaId: uuid('housesigma_id')
      .notNull()
      .references(() => housesigmaRaw.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.accountId, t.housesigmaId] }),
  }),
)

// Define relations
export const housesigmaRelations = relations(housesigmaRaw, ({ many }) => ({
  accountHousesigma: many(houseSigma),
}))

export const accountHousesigmaRelations = relations(houseSigma, ({ one }) => ({
  housesigma: one(housesigmaRaw, {
    fields: [houseSigma.housesigmaId],
    references: [housesigmaRaw.id],
  }),
  account: one(accounts, {
    fields: [houseSigma.accountId],
    references: [accounts.id],
  }),
}))
