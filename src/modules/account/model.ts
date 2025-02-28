import { relations } from 'drizzle-orm'
import { boolean, timestamp, pgTable, text, primaryKey, integer } from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type User = typeof users.$inferSelect

export const userAccounts = pgTable(
  'user_account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ],
)

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ],
)

export const accounts = pgTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type Account = typeof accounts.$inferSelect

export const ACCOUNT_ROLES = ['owner', 'read', 'read-write'] as const
export type AccountRole = (typeof ACCOUNT_ROLES)[number]

// Junction table for many-to-many relationship
export const accountUsers = pgTable(
  'account_users',
  {
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role', { enum: ACCOUNT_ROLES }).$type<AccountRole>().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.accountId, t.userId] }),
  }),
)

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  accountUsers: many(accountUsers),
}))

export const accountsRelations = relations(accounts, ({ many }) => ({
  accountUsers: many(accountUsers),
}))

export const accountUsersRelations = relations(accountUsers, ({ one }) => ({
  user: one(users, {
    fields: [accountUsers.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [accountUsers.accountId],
    references: [accounts.id],
  }),
}))

export const accountInvites = pgTable('account_invites', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id),
  email: text('email').notNull(),
  role: text('role', { enum: ACCOUNT_ROLES }).$type<AccountRole>().notNull(),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => users.id),
  status: text('status', { enum: ['pending', 'accepted', 'rejected', 'expired'] })
    .notNull()
    .default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const accountPreferences = pgTable('account_preferences', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id),
  isFirstTimeHomeBuyer: boolean('is_first_time_home_buyer').notNull(),
  province: text('province').notNull(),
  priorities: text('priorities').array().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const EXPORT_JOB_STATUS = ['pending', 'processing', 'completed', 'failed'] as const
export type ExportJobStatus = (typeof EXPORT_JOB_STATUS)[number]

export const accountExportJobs = pgTable('account_export_jobs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id),
  requestedBy: text('requested_by')
    .notNull()
    .references(() => users.id),
  status: text('status', { enum: EXPORT_JOB_STATUS }).$type<ExportJobStatus>().notNull().default('pending'),
  error: text('error'),
  downloadUrl: text('download_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
})
