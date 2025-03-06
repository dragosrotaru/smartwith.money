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
  AccountExportJob,
  verificationTokens,
} from './model'
import { and, eq, sql, desc } from 'drizzle-orm'
import { sendInviteEmail, sendAccountDeletionFeedbackEmail, sendVerificationEmail } from '../notifications/email'
import { feedback } from '../feedback/model'
import { Province } from '../location/provinces'
import { createCustomer, getActiveSubscription, cancelSubscription } from '@/modules/billing/service'
import { randomBytes } from 'crypto'
import { uploadProfilePicture } from '@/lib/blob'

/* AUTHORIZATION */

/**
 * Returns the user and any active accounts they have access to,
 * as well as the active account id
 */
export async function authorization() {
  const session = await auth()
  if (!session || !session.user.id) return new Error('Unauthorized')

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      activeAccountId: users.activeAccountId,
      name: users.name,
      image: users.image,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

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

  // fix the user activeAccountId if the company is inactive or not found
  if (user.activeAccountId && accountsWithRoles.find((a) => a.id === user.activeAccountId)?.isInactive) {
    await clearActiveAccount()
    user.activeAccountId = null
  }

  return {
    user,
    accounts: accountsWithRoles,
    activeAccountId: user.activeAccountId,
  }
}

/**
 * Returns the user and the active account if they have read access to it
 */
export async function withReadAccess() {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  if (!auth.activeAccountId) return new Error('No active account')

  const account = auth.accounts.find((a) => a.id === auth.activeAccountId)
  if (!account) return new Error('Account not found')

  if (account?.role === 'read' || account?.role === 'read-write' || account?.role === 'owner')
    return { ...auth, activeAccountId: account.id }
  return new Error('Unauthorized')
}

/**
 * Returns the user and the active account if they have read-write access to it
 */
export async function withReadWriteAccess() {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  if (!auth.activeAccountId) return new Error('No active account')

  const account = auth.accounts.find((a) => a.id === auth.activeAccountId)
  if (!account) return new Error('Account not found')

  if (account?.role === 'read-write' || account?.role === 'owner') return { ...auth, activeAccountId: account.id }
  return new Error('Unauthorized')
}

/**
 * Returns the user and the active account if they have owner access to it
 */
export async function withOwnerAccess() {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  if (!auth.activeAccountId) return new Error('No active account')

  const account = auth.accounts.find((a) => a.id === auth.activeAccountId)
  if (!account) return new Error('Account not found')

  if (account?.role === 'owner') return { ...auth, activeAccountId: account.id }
  return new Error('Unauthorized')
}

/* ACTIVE ACCOUNT */

/**
 * Returns the active account id for the user
 */
export async function getActiveAccount(): Promise<string | undefined> {
  const auth = await authorization()
  if (auth instanceof Error) return undefined

  return auth.activeAccountId ?? undefined
}

/**
 * This should only be used in the client ActiveAccountContext, since the client
 * needs to be informed that that the active account has changed.
 * @param accountId
 */
export async function setActiveAccount(accountId: string) {
  const auth = await authorization()
  if (auth instanceof Error) throw new Error('Unauthorized')

  await db
    .update(users)
    .set({
      activeAccountId: accountId,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(users.id, auth.user.id))
}

/**
 * Clears the active account for the user
 */
export async function clearActiveAccount() {
  const auth = await authorization()
  if (auth instanceof Error) throw new Error('Unauthorized')

  await db
    .update(users)
    .set({
      activeAccountId: null,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(users.id, auth.user.id))
}

/* ACCOUNT ACTIONS */

/**
 * Returns the preferences for the active account
 */
export async function getAccountPreferences() {
  const auth = await withReadAccess()
  if (auth instanceof Error) return auth

  const [preferences] = await db
    .select()
    .from(accountPreferences)
    .where(eq(accountPreferences.accountId, auth.activeAccountId))
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

/**
 * Completes the onboarding process for a user to create an account
 */
export async function completeOnboarding(data: OnboardingData) {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  if (!auth.user.id) return new Error('Unauthorized')

  try {
    // Create new account for user and set up billing
    const account = await db.transaction(async (tx) => {
      // Create Stripe customer
      const customer = await createCustomer({
        email: auth.user.email!,
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
        userId: auth.user.id,
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
        invitedBy: auth.user.id,
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

/* USERS & PERMISSIONS */

/**
 * Returns the users and invites for the active account
 */
export async function getAccountUsers() {
  const auth = await withOwnerAccess()
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
    .where(eq(accountUsers.accountId, auth.activeAccountId))

  const invites = await db.select().from(accountInvites).where(eq(accountInvites.accountId, auth.activeAccountId))

  return { users: usersList, invites }
}

/**
 * Checks if the user is the last owner of the account
 */
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

/**
 * Updates the role of a user in the active account
 */
export async function updateUserRole(userId: string, role: AccountRole) {
  const auth = await withOwnerAccess()
  if (auth instanceof Error) return auth

  try {
    // If we're changing to non-owner role, check if they're the last owner
    if (role !== 'owner' && (await isLastOwner(auth.activeAccountId, userId))) {
      return new Error('Cannot remove the last owner of the account')
    }

    await db
      .update(accountUsers)
      .set({
        role,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(accountUsers.accountId, auth.activeAccountId), eq(accountUsers.userId, userId)))

    return { success: true }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return new Error('Failed to update user role')
  }
}

/**
 * Removes a user from the active account
 */
export async function removeUser(userId: string) {
  const auth = await withOwnerAccess()
  if (auth instanceof Error) return auth

  try {
    if (await isLastOwner(auth.activeAccountId, userId)) {
      return new Error('Cannot remove the last owner of the account')
    }

    // Remove the user
    await db
      .delete(accountUsers)
      .where(and(eq(accountUsers.accountId, auth.activeAccountId), eq(accountUsers.userId, userId)))

    return { success: true }
  } catch (error) {
    console.error('Failed to remove user:', error)
    return new Error('Failed to remove user')
  }
}

/**
 * Sends an invite to the user
 */
export async function sendInvite(email: string, role: AccountRole) {
  const authResult = await withOwnerAccess()
  if (authResult instanceof Error) return authResult

  try {
    // Store the invite in the database
    const [invite] = await db
      .insert(accountInvites)
      .values({
        accountId: authResult.activeAccountId,
        email,
        role,
        invitedBy: authResult.user.id,
      })
      .returning()

    // Get the account name for the email
    const [account] = await db
      .select({ name: accounts.name })
      .from(accounts)
      .where(eq(accounts.id, authResult.activeAccountId))
      .limit(1)
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

/**
 * Resends an invite email to the user
 */
export async function resendInvite(inviteId: string) {
  const auth = await withOwnerAccess()
  if (auth instanceof Error) return auth

  const [invite] = await db
    .select({
      id: accountInvites.id,
      accountId: accountInvites.accountId,
      email: accountInvites.email,
      role: accountInvites.role,
      accountName: accounts.name,
    })
    .from(accountInvites)
    .innerJoin(accounts, and(eq(accounts.id, accountInvites.accountId), eq(accounts.isInactive, false)))
    .where(eq(accountInvites.id, inviteId))
    .limit(1)

  if (invite?.accountId !== auth.activeAccountId) return new Error('Invite not found')

  if (!invite) return new Error('Invite not found')

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

/**
 * Cancels an invite
 */
export async function cancelInvite(inviteId: string) {
  const auth = await withOwnerAccess()
  if (auth instanceof Error) return auth

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

  if (invite.accountId !== auth.activeAccountId) return new Error('Invite not found')

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

/**
 * Returns the pending invites for the current user
 */
export async function getPendingInvites() {
  const auth = await authorization()
  if (auth instanceof Error) return auth
  if (!auth.user.email) return new Error('Unauthorized')

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
          eq(accountInvites.email, auth.user.email),
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

/**
 * Accepts an invite
 */
export async function acceptInvite(inviteId: string) {
  const auth = await authorization()
  if (auth instanceof Error) return auth
  if (!auth.user.email) return new Error('Unauthorized')

  try {
    // Verify the invite belongs to the user and is pending
    const [invite] = await db
      .select()
      .from(accountInvites)
      .where(
        and(
          eq(accountInvites.id, inviteId),
          eq(accountInvites.email, auth.user.email),
          eq(accountInvites.status, 'pending'),
        ),
      )
      .limit(1)

    if (!invite) return new Error('Invite not found')

    // Add user to account
    await db.insert(accountUsers).values({
      accountId: invite.accountId,
      userId: auth.user.id,
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

/**
 * Rejects an invite
 */
export async function rejectInvite(inviteId: string) {
  const auth = await authorization()
  if (auth instanceof Error) return auth
  if (!auth.user.email) return new Error('Unauthorized')

  try {
    // Verify the invite belongs to the user and is pending
    const [invite] = await db
      .select()
      .from(accountInvites)
      .where(
        and(
          eq(accountInvites.id, inviteId),
          eq(accountInvites.email, auth.user.email),
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

/* EXPORT JOBS */

/**
 * Creates an export job
 */
export async function createExportJob() {
  const auth = await withOwnerAccess()
  if (auth instanceof Error) return auth

  try {
    const [job] = await db
      .insert(accountExportJobs)
      .values({
        accountId: auth.activeAccountId,
        requestedBy: auth.user.id,
      })
      .returning()

    return { success: true, jobId: job.id }
  } catch (error) {
    console.error('Failed to create export job:', error)
    return new Error('Failed to create export job')
  }
}

export type AccountExportJobViewModel = Omit<AccountExportJob, 'requestedBy'> & {
  requestedBy: {
    id: string
    name: string | null
    email: string | null
  }
}

/**
 * Returns the export jobs for the active account
 */
export async function getExportJobs() {
  const auth = await withOwnerAccess()
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
        updatedAt: accountExportJobs.updatedAt,
        accountId: accountExportJobs.accountId,
        requestedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(accountExportJobs)
      .innerJoin(users, eq(users.id, accountExportJobs.requestedBy))
      .where(eq(accountExportJobs.accountId, auth.activeAccountId))
      .orderBy(desc(accountExportJobs.createdAt))

    return jobs
  } catch (error) {
    console.error('Failed to get export jobs:', error)
    return new Error('Failed to get export jobs')
  }
}

/**
 * Downloads an export job
 */
export async function downloadExport(jobId: string) {
  const auth = await withOwnerAccess()
  if (auth instanceof Error) return auth

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

  if (job.accountId !== auth.activeAccountId) return new Error('Export not found')

  return { url: job.downloadUrl }
}

/* DELETE ACCOUNT */

/**
 * Deletes the active account
 */
export async function deleteAccount() {
  const auth = await withOwnerAccess()
  if (auth instanceof Error) return auth

  try {
    // Cancel Stripe subscription if it exists
    const subscription = await getActiveSubscription(auth.activeAccountId)
    if (subscription) {
      await cancelSubscription(subscription.stripeId)
    }

    // Mark account as inactive and update all related data
    await db.transaction(async (tx) => {
      await tx
        .update(accounts)
        .set({
          isInactive: true,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(accounts.id, auth.activeAccountId))

      // Cancel any pending invites
      await tx
        .update(accountInvites)
        .set({
          status: 'cancelled',
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(and(eq(accountInvites.accountId, auth.activeAccountId), eq(accountInvites.status, 'pending')))
    })

    // Cancel any pending export jobs
    await db
      .update(accountExportJobs)
      .set({
        status: 'cancelled',
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(accountExportJobs.accountId, auth.activeAccountId), eq(accountExportJobs.status, 'pending')))

    return { success: true }
  } catch (error) {
    console.error('Failed to delete account:', error)
    return new Error('Failed to delete account')
  }
}

export async function submitAccountDeletionFeedback(reason: string, improvementSuggestions?: string) {
  const authResult = await withOwnerAccess()
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
      .where(eq(accounts.id, authResult.activeAccountId))
      .limit(1)

    if (!account) return new Error('Account not found')

    // Store feedback
    await db.insert(feedback).values({
      userId: authResult.user.id,
      accountId: authResult.activeAccountId,
      activity: 'account_deletion',
      reason,
      improvementSuggestions,
    })

    // Calculate days active
    const daysActive = Math.floor((Date.now() - account.createdAt.getTime()) / (1000 * 60 * 60 * 24))

    // Get subscription status
    const subscription = await getActiveSubscription(authResult.activeAccountId)

    // Send email notification
    await sendAccountDeletionFeedbackEmail({
      userEmail: authResult.user.email!,
      accountName: account.name,
      reason,
      improvementSuggestions,
      daysActive,
      plan: subscription !== null ? 'Paid' : 'Free',
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to submit feedback:', error)
    return new Error('Failed to submit feedback')
  }
}

/**
 * Updates the user's email address and sends a verification email
 * Requires authentication and validates the new email format
 */
export async function updateEmail(newEmail: string): Promise<Error | null> {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  if (!newEmail || !newEmail.includes('@')) {
    return new Error('Invalid email address')
  }

  // Check if email is already taken
  const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, newEmail)).limit(1)

  if (existingUser.length > 0) {
    return new Error('Email address is already in use')
  }

  // Update the email and send verification
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        email: newEmail,
        emailVerified: null, // Reset email verification status
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(users.id, auth.user.id))

    await tx.insert(verificationTokens).values({
      identifier: newEmail,
      token,
      expires,
    })
  })

  await sendVerificationEmail({ email: newEmail, token })
  return null
}

/**
 * Verifies an email address using a token
 */
export async function verifyEmail(token: string): Promise<Error | true> {
  // Find the verification token
  const [verificationToken] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1)

  if (!verificationToken) {
    return new Error('Invalid or expired verification token')
  }

  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token))
    return new Error('Verification token has expired')
  }

  // Update user's email verification status
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        emailVerified: new Date(),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(users.email, verificationToken.identifier))

    // Delete the used token
    await tx.delete(verificationTokens).where(eq(verificationTokens.token, token))
  })

  return true
}

/**
 * Updates the user's name
 */
export async function updateName(newName: string): Promise<Error | null> {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  if (!newName.trim()) {
    return new Error('Name cannot be empty')
  }

  try {
    await db
      .update(users)
      .set({
        name: newName.trim(),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(users.id, auth.user.id))

    return null
  } catch (error) {
    console.error('Failed to update name:', error)
    return new Error('Failed to update name')
  }
}

/**
 * Uploads a profile picture file to Vercel Blob and returns the URL
 */
export async function updateProfilePicture(file: File): Promise<string | Error> {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  try {
    const url = await uploadProfilePicture(file, `profile-pictures/${auth.user.id}-${Date.now()}`)

    // Update the user's profile picture URL
    await db
      .update(users)
      .set({
        image: url,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(users.id, auth.user.id))

    return url
  } catch (error) {
    console.error('Failed to upload profile picture:', error)
    return new Error('Failed to upload profile picture')
  }
}
