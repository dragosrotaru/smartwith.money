'use server'
import { auth } from '@/auth'
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
import { sendInviteEmail, sendAccountDeletionFeedbackEmail } from '../notifications/email'
import { feedback } from '../feedback/model'
import { Province } from '../location/provinces'
import { createCustomer } from '@/modules/billing/service'

/**
 * Returns the user and any active accounts they have access to
 */
export async function authorization() {
  const session = await auth()
  if (!session || !session.user.id) return new Error('Unauthorized')

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id))

  if (!user) return new Error('User not found')

  const accountsWithRoles = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      role: accountUsers.role,
      isInactive: accounts.isInactive,
    })
    .from(accounts)
    .innerJoin(accountUsers, eq(accounts.id, accountUsers.accountId))
    .where(and(eq(accountUsers.userId, session.user.id), eq(accounts.isInactive, false)))

  return {
    user,
    accounts: accountsWithRoles,
  }
}

/**
 * Returns the user and the active account if they have read access to it
 */
export async function withReadAccess(accountId: string) {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  const account = auth.accounts.find((a) => a.id === accountId)
  if (!account) return new Error('Account not found')
  if (account?.role === 'read' || account?.role === 'read-write' || account?.role === 'owner') return auth
  return new Error('Unauthorized')
}

/**
 * Returns the user and the active account if they have read-write access to it
 */
export async function withReadWriteAccess(accountId: string) {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  const account = auth.accounts.find((a) => a.id === accountId)
  if (!account) return new Error('Account not found')
  if (account?.role === 'read-write' || account?.role === 'owner') return auth
  return new Error('Unauthorized')
}

/**
 * Returns the user and the active account if they have owner access to it
 */
export async function withOwnerAccess(accountId: string) {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  const account = auth.accounts.find((a) => a.id === accountId)
  if (!account) return new Error('Account not found')
  if (account?.role === 'owner') return auth
  return new Error('Unauthorized')
}

export async function getAccountPreferences(accountId: string) {
  const auth = await withReadAccess(accountId)
  if (auth instanceof Error) return auth

  const [preferences] = await db
    .select()
    .from(accountPreferences)
    .where(eq(accountPreferences.accountId, accountId))
    .limit(1)

  if (!preferences) return new Error('Account preferences not found')

  return preferences
}

export type OnboardingData = {
  accountName: string
  invitedPeople: { email: string; role: string }[]
  isFirstTimeHomeBuyer: boolean
  province: Province
  priorities: string[]
}

export async function completeOnboarding(data: OnboardingData) {
  const session = await auth()
  if (!session || !session.user.id) return new Error('Unauthorized')

  try {
    // Create new account for user and set up billing
    const account = await db.transaction(async (tx) => {
      // Create Stripe customer
      const customer = await createCustomer({
        email: session.user.email!,
        name: data.accountName,
      })

      // Create new account
      const [account] = await tx
        .insert(accounts)
        .values({
          name: data.accountName,
          stripeCustomerId: customer.id,
        })
        .returning()

      // Add user as owner
      await tx.insert(accountUsers).values({
        userId: session.user.id,
        accountId: account.id,
        role: 'owner',
      })

      return account
    })

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

async function isLastOwner(accountId: string, userId: string): Promise<boolean> {
  // Check if user is an owner
  const [currentUser] = await db
    .select({ role: accountUsers.role })
    .from(accountUsers)
    .where(and(eq(accountUsers.accountId, accountId), eq(accountUsers.userId, userId)))
    .limit(1)

  if (currentUser?.role !== 'owner') return false

  // Count owners
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(accountUsers)
    .where(and(eq(accountUsers.accountId, accountId), eq(accountUsers.role, 'owner')))

  return count <= 1
}

export async function updateUserRole(accountId: string, userId: string, role: AccountRole) {
  const auth = await withOwnerAccess(accountId)
  if (auth instanceof Error) return auth

  try {
    // If we're changing to non-owner role, check if they're the last owner
    if (role !== 'owner' && (await isLastOwner(accountId, userId))) {
      return new Error('Cannot remove the last owner of the account')
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
      .where(
        and(
          eq(accountInvites.email, session.user.email),
          eq(accountInvites.status, 'pending'),
          eq(accounts.isInactive, false),
        ),
      )

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
        invitedBy: authResult.user.id,
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

export async function deleteAccount(accountId: string) {
  const auth = await withOwnerAccess(accountId)
  if (auth instanceof Error) return auth

  try {
    // Get the stripe subscription ID if it exists
    // todo implement this after moving the customerid to the account table
    /* const [subscription] = await db
      .select({ stripeSubscriptionId: accounts.stripeSubscriptionId })
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1) */

    // Cancel Stripe subscription if it exists
    /* if (subscription?.stripeSubscriptionId) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
    } */

    // Mark account as inactive and update all related data
    await db.transaction(async (tx) => {
      await tx
        .update(accounts)
        .set({
          isInactive: true,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(accounts.id, accountId))

      // Cancel any pending invites
      await tx
        .update(accountInvites)
        .set({
          status: 'cancelled',
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(and(eq(accountInvites.accountId, accountId), eq(accountInvites.status, 'pending')))
    })

    // Cancel any pending export jobs
    await db
      .update(accountExportJobs)
      .set({
        status: 'cancelled',
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(accountExportJobs.accountId, accountId), eq(accountExportJobs.status, 'pending')))

    return { success: true }
  } catch (error) {
    console.error('Failed to delete account:', error)
    return new Error('Failed to delete account')
  }
}

export async function cancelInvite(inviteId: string) {
  // Get the invite details first to verify ownership
  const [invite] = await db
    .select({
      accountId: accountInvites.accountId,
      status: accountInvites.status,
    })
    .from(accountInvites)
    .where(eq(accountInvites.id, inviteId))
    .limit(1)

  if (!invite) return new Error('Invite not found')
  if (invite.status !== 'pending') return new Error('Can only cancel pending invites')

  // Verify user has owner access to this account
  const auth = await withOwnerAccess(invite.accountId)
  if (auth instanceof Error) return auth

  try {
    await db
      .update(accountInvites)
      .set({
        status: 'cancelled',
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(accountInvites.id, inviteId))

    return { success: true }
  } catch (error) {
    console.error('Failed to cancel invite:', error)
    return new Error('Failed to cancel invite')
  }
}

export async function removeUser(accountId: string, userId: string) {
  const auth = await withOwnerAccess(accountId)
  if (auth instanceof Error) return auth

  try {
    if (await isLastOwner(accountId, userId)) {
      return new Error('Cannot remove the last owner of the account')
    }

    // Remove the user
    await db.delete(accountUsers).where(and(eq(accountUsers.accountId, accountId), eq(accountUsers.userId, userId)))

    return { success: true }
  } catch (error) {
    console.error('Failed to remove user:', error)
    return new Error('Failed to remove user')
  }
}

export async function submitAccountDeletionFeedback(
  accountId: string,
  reason: string,
  improvementSuggestions?: string,
) {
  const authResult = await withOwnerAccess(accountId)
  if (authResult instanceof Error) return authResult

  try {
    // Get account details
    const [account] = await db
      .select({
        name: accounts.name,
        createdAt: accounts.createdAt,
        isInactive: accounts.isInactive,
      })
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1)

    if (!account) return new Error('Account not found')

    // Store feedback
    await db.insert(feedback).values({
      userId: authResult.user.id,
      accountId,
      activity: 'account_deletion',
      reason,
      improvementSuggestions,
    })

    // Calculate days active
    const daysActive = Math.floor((Date.now() - account.createdAt.getTime()) / (1000 * 60 * 60 * 24))

    // Send email notification
    await sendAccountDeletionFeedbackEmail({
      userEmail: authResult.user.email!,
      accountName: account.name,
      reason,
      improvementSuggestions,
      daysActive,
      plan: 'Free', // TODO: Update this when we have subscription info
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to submit feedback:', error)
    return new Error('Failed to submit feedback')
  }
}
