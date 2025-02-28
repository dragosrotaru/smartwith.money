'use server'
import { auth } from '@/auth'
import { getUserAndAccounts, createNewAccountForUser } from './repo'
import { db } from '@/lib/db'
import {
  accountInvites,
  accountPreferences,
  AccountRole,
  accountUsers,
  users,
  accounts,
  accountExportJobs,
} from './model'
import { and, eq, sql, desc } from 'drizzle-orm'
import { sendInviteEmail } from '../notifications/email'

export async function authorization() {
  const session = await auth()
  if (!session || !session.user.id) return new Error('Unauthorized')
  return await getUserAndAccounts(session.user.id)
}

export async function withReadWriteAccess(accountId: string) {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  const account = auth.accounts.find((a) => a.id === accountId)
  if (account?.role === 'read-write' || account?.role === 'owner') return auth
  return new Error('Unauthorized')
}

export async function withReadAccess(accountId: string) {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  const account = auth.accounts.find((a) => a.id === accountId)
  if (account?.role === 'read' || account?.role === 'read-write' || account?.role === 'owner') return auth
  return new Error('Unauthorized')
}

export async function withOwnerAccess(accountId: string) {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  const account = auth.accounts.find((a) => a.id === accountId)
  if (account?.role === 'owner') return auth
  return new Error('Unauthorized')
}

export type OnboardingData = {
  accountName: string
  invitedPeople: { email: string; role: string }[]
  isFirstTimeHomeBuyer: boolean
  province: string
  priorities: string[]
}

export async function completeOnboarding(data: OnboardingData) {
  const session = await auth()
  if (!session || !session.user.id) return new Error('Unauthorized')

  try {
    const account = await createNewAccountForUser(session.user.id, data.accountName)

    // Invite people if any
    for (const person of data.invitedPeople) {
      // Store the invite in the database
      await db.insert(accountInvites).values({
        accountId: account.id,
        email: person.email,
        role: person.role as AccountRole,
        invitedBy: session.user.id,
      })

      // Send invite email
      await sendInviteEmail({
        email: person.email,
        accountName: data.accountName,
        role: person.role as AccountRole,
      })
    }

    // Store account preferences
    await db.insert(accountPreferences).values({
      accountId: account.id,
      isFirstTimeHomeBuyer: data.isFirstTimeHomeBuyer,
      province: data.province,
      priorities: data.priorities,
    })

    return { success: true, accountId: account.id }
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    return new Error('Failed to complete onboarding')
  }
}

export async function getAccountUsers(accountId: string) {
  const auth = await withOwnerAccess(accountId)
  if (auth instanceof Error) return auth

  const usersList = await db
    .select({
      userId: accountUsers.userId,
      accountId: accountUsers.accountId,
      role: accountUsers.role,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(accountUsers)
    .innerJoin(users, eq(users.id, accountUsers.userId))
    .where(eq(accountUsers.accountId, accountId))

  const invites = await db.select().from(accountInvites).where(eq(accountInvites.accountId, accountId))

  return { users: usersList, invites }
}

export async function updateUserRole(accountId: string, userId: string, role: AccountRole) {
  const auth = await withOwnerAccess(accountId)
  if (auth instanceof Error) return auth

  try {
    // Get the user's current role
    const [currentUser] = await db
      .select({ role: accountUsers.role })
      .from(accountUsers)
      .where(and(eq(accountUsers.accountId, accountId), eq(accountUsers.userId, userId)))
      .limit(1)

    // If we're changing an owner to non-owner, check if they're the last owner
    if (currentUser?.role === 'owner' && role !== 'owner') {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(accountUsers)
        .where(and(eq(accountUsers.accountId, accountId), eq(accountUsers.role, 'owner')))

      if (count <= 1) {
        return new Error('Cannot remove the last owner of the account')
      }
    }

    await db
      .update(accountUsers)
      .set({
        role,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(accountUsers.accountId, accountId), eq(accountUsers.userId, userId)))

    return { success: true }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return new Error('Failed to update user role')
  }
}

export async function resendInvite(inviteId: string) {
  const [invite] = await db
    .select({
      id: accountInvites.id,
      accountId: accountInvites.accountId,
      email: accountInvites.email,
      role: accountInvites.role,
      accountName: accounts.name,
    })
    .from(accountInvites)
    .innerJoin(accounts, eq(accounts.id, accountInvites.accountId))
    .where(eq(accountInvites.id, inviteId))
    .limit(1)

  if (!invite) return new Error('Invite not found')

  const auth = await withOwnerAccess(invite.accountId)
  if (auth instanceof Error) return auth

  try {
    await db
      .update(accountInvites)
      .set({
        status: 'pending',
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(accountInvites.id, inviteId))

    // Send the invite email
    await sendInviteEmail({
      email: invite.email,
      accountName: invite.accountName,
      role: invite.role,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to resend invite:', error)
    return new Error('Failed to resend invite')
  }
}

export async function getPendingInvites() {
  const session = await auth()
  if (!session?.user?.email) return new Error('Unauthorized')

  try {
    const pendingInvites = await db
      .select({
        id: accountInvites.id,
        accountId: accountInvites.accountId,
        accountName: accounts.name,
        role: accountInvites.role,
      })
      .from(accountInvites)
      .innerJoin(accounts, eq(accounts.id, accountInvites.accountId))
      .where(and(eq(accountInvites.email, session.user.email), eq(accountInvites.status, 'pending')))

    return pendingInvites
  } catch (error) {
    console.error('Failed to fetch pending invites:', error)
    return new Error('Failed to fetch pending invites')
  }
}

export async function acceptInvite(inviteId: string) {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.email) return new Error('Unauthorized')

  try {
    // Verify the invite belongs to the user and is pending
    const [invite] = await db
      .select()
      .from(accountInvites)
      .where(
        and(
          eq(accountInvites.id, inviteId),
          eq(accountInvites.email, session.user.email as string),
          eq(accountInvites.status, 'pending'),
        ),
      )
      .limit(1)

    if (!invite) return new Error('Invite not found')

    // Add user to account
    await db.insert(accountUsers).values({
      accountId: invite.accountId,
      userId: session.user.id,
      role: invite.role,
    })

    // Update invite status
    await db
      .update(accountInvites)
      .set({
        status: 'accepted',
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(accountInvites.id, inviteId))

    return { success: true }
  } catch (error) {
    console.error('Failed to accept invite:', error)
    return new Error('Failed to accept invite')
  }
}

export async function rejectInvite(inviteId: string) {
  const session = await auth()
  if (!session?.user?.email) return new Error('Unauthorized')

  try {
    // Verify the invite belongs to the user and is pending
    const [invite] = await db
      .select()
      .from(accountInvites)
      .where(
        and(
          eq(accountInvites.id, inviteId),
          eq(accountInvites.email, session.user.email as string),
          eq(accountInvites.status, 'pending'),
        ),
      )
      .limit(1)

    if (!invite) return new Error('Invite not found')

    // Update invite status to rejected
    await db
      .update(accountInvites)
      .set({
        status: 'rejected',
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(accountInvites.id, inviteId))

    return { success: true }
  } catch (error) {
    console.error('Failed to reject invite:', error)
    return new Error('Failed to reject invite')
  }
}

export async function sendInvite(accountId: string, email: string, role: AccountRole) {
  const session = await auth()
  if (!session?.user?.id) return new Error('Unauthorized')

  const authResult = await withOwnerAccess(accountId)
  if (authResult instanceof Error) return authResult

  try {
    // Store the invite in the database
    const [invite] = await db
      .insert(accountInvites)
      .values({
        accountId,
        email,
        role,
        invitedBy: session.user.id,
      })
      .returning()

    // Get the account name for the email
    const [account] = await db.select({ name: accounts.name }).from(accounts).where(eq(accounts.id, accountId)).limit(1)
    if (!account) return new Error('Account not found')

    // Send invite email
    await sendInviteEmail({
      email,
      accountName: account.name,
      role,
    })

    return { success: true, inviteId: invite.id }
  } catch (error) {
    console.error('Failed to send invite:', error)
    return new Error('Failed to send invite')
  }
}

export async function createExportJob(accountId: string) {
  const auth = await withOwnerAccess(accountId)
  if (auth instanceof Error) return auth

  try {
    const [job] = await db
      .insert(accountExportJobs)
      .values({
        accountId,
        requestedBy: auth.user.id,
      })
      .returning()

    return { success: true, jobId: job.id }
  } catch (error) {
    console.error('Failed to create export job:', error)
    return new Error('Failed to create export job')
  }
}

export async function getExportJobs(accountId: string) {
  const auth = await withOwnerAccess(accountId)
  if (auth instanceof Error) return auth

  try {
    const jobs = await db
      .select({
        id: accountExportJobs.id,
        status: accountExportJobs.status,
        error: accountExportJobs.error,
        downloadUrl: accountExportJobs.downloadUrl,
        createdAt: accountExportJobs.createdAt,
        completedAt: accountExportJobs.completedAt,
        requestedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(accountExportJobs)
      .innerJoin(users, eq(users.id, accountExportJobs.requestedBy))
      .where(eq(accountExportJobs.accountId, accountId))
      .orderBy(desc(accountExportJobs.createdAt))

    return jobs
  } catch (error) {
    console.error('Failed to get export jobs:', error)
    return new Error('Failed to get export jobs')
  }
}

export async function downloadExport(jobId: string) {
  // Get the export job
  const [job] = await db
    .select({
      accountId: accountExportJobs.accountId,
      downloadUrl: accountExportJobs.downloadUrl,
      status: accountExportJobs.status,
    })
    .from(accountExportJobs)
    .where(eq(accountExportJobs.id, jobId))
    .limit(1)

  if (!job || job.status !== 'completed' || !job.downloadUrl) {
    return new Error('Export not found or not ready')
  }

  // Verify user has owner access to this account
  const auth = await withOwnerAccess(job.accountId)
  if (auth instanceof Error) return auth

  return { url: job.downloadUrl }
}
