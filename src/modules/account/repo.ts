import { and, eq } from 'drizzle-orm'
import { users, accounts, accountUsers, type AccountRole } from './model'
import { db } from '@/lib/db'

export async function getUserByEmail(email: string) {
  const user = await db.select().from(users).where(eq(users.email, email))
  return user
}

export async function getUserAndAccounts(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id))

  if (!user) return new Error('User not found')

  const accountsWithRoles = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      role: accountUsers.role,
    })
    .from(accounts)
    .innerJoin(accountUsers, eq(accounts.id, accountUsers.accountId))
    .where(eq(accountUsers.userId, id))

  return {
    user,
    accounts: accountsWithRoles,
  }
}

export async function createNewAccountForUser(userId: string, accountName: string) {
  return await db.transaction(async (tx) => {
    // Create new account
    const [account] = await tx
      .insert(accounts)
      .values({
        name: accountName,
      })
      .returning()

    // Add user as owner
    await tx.insert(accountUsers).values({
      userId,
      accountId: account.id,
      role: 'owner',
    })

    return account
  })
}

export async function addUserToAccount(accountId: string, userId: string, role: AccountRole) {
  // Add user to account
  return await db
    .insert(accountUsers)
    .values({
      userId,
      accountId,
      role,
    })
    .returning()
}

export async function updateUserRole(accountId: string, userId: string, newRole: AccountRole) {
  // If changing from owner, verify at least one other owner exists
  if (newRole !== 'owner') {
    const owners = await db
      .select()
      .from(accountUsers)
      .where(and(eq(accountUsers.accountId, accountId), eq(accountUsers.role, 'owner')))

    if (owners.length === 1 && owners[0].userId === userId) {
      return new Error('Account must have at least one owner')
    }
  }

  return await db
    .update(accountUsers)
    .set({ role: newRole })
    .where(and(eq(accountUsers.accountId, accountId), eq(accountUsers.userId, userId)))
    .returning()
}

export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
  await db
    .update(users)
    .set({
      stripeCustomerId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}
