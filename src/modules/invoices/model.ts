import { pgTable, text, timestamp, decimal, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { accounts } from '../account/model'

export const invoices = pgTable('invoice', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id')
    .references(() => accounts.id)
    .notNull(),
  number: text('number').notNull(),
  date: timestamp('date').notNull(),
  fromCompanyId: uuid('from_company_id')
    .references(() => companies.id)
    .notNull(),
  toCompanyId: uuid('to_company_id')
    .references(() => companies.id)
    .notNull(),
  terms: text('terms').notNull(),
  currency: text('currency').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert

export const invoiceItems = pgTable('invoice_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .references(() => invoices.id)
    .notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
  taxType: text('tax_type').notNull(),
})
export type InvoiceItem = typeof invoiceItems.$inferSelect
export type NewInvoiceItem = typeof invoiceItems.$inferInsert

export const companies = pgTable('invoice_company', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  businessNumber: text('business_number'),
  taxNumber: text('tax_number'),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
export type InvoiceCompany = typeof companies.$inferSelect
export type NewInvoiceCompany = typeof companies.$inferInsert

export const invoiceRelations = relations(invoices, ({ one, many }) => ({
  fromCompany: one(companies, {
    fields: [invoices.fromCompanyId],
    references: [companies.id],
  }),
  toCompany: one(companies, {
    fields: [invoices.toCompanyId],
    references: [companies.id],
  }),
  items: many(invoiceItems),
}))

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}))
