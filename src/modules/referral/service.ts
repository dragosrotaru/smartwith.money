import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { referralCodes, referralUses } from './model'
import { stripe } from '@/modules/billing/service'
import { subscriptions } from '@/modules/billing/model'
import { accounts, accountUsers } from '@/modules/account/model'
import Stripe from 'stripe'

/**
 * Records a referral use
 */
export async function recordReferralUse(code: string, newUserId: string): Promise<null | Error> {
  // Get the referral code
  const [referralCode] = await db
    .select()
    .from(referralCodes)
    .where(and(eq(referralCodes.code, code), eq(referralCodes.active, true)))
    .limit(1)

  // User cannot use their own referral code
  if (referralCode.userId === newUserId) return new Error('You cannot use your own referral code')

  // Referral code must be valid and active
  if (!referralCode) return new Error('Invalid or inactive referral code')

  // Record the referral use (without completing it)
  // Fails if the user has already used a referral code due to db constraint
  try {
    await db.insert(referralUses).values({
      referralCodeId: referralCode.id,
      referredUserId: newUserId,
    })
    return null
  } catch (error) {
    return error instanceof Error ? error : new Error('Failed to record referral use')
  }
}

/**
 * Completes a referral use when subscribing to an account.
 * This is called during the subscription process.
 * An account can only use one referral code in its lifetime.
 */
export async function completeReferralUse(userId: string, accountId: string): Promise<boolean | Error> {
  // Get the user's incomplete referral use
  const userReferralUses = await db.select().from(referralUses).where(eq(referralUses.referredUserId, userId))

  const [referralUse] = userReferralUses.filter((use) => use.completedAt === null)
  // No referral to complete, not an error
  if (!referralUse) return false

  // Check if account has already used any referral code (lifetime constraint)
  const completedReferrals = userReferralUses.filter((use) => use.completedAt !== null)
  if (completedReferrals.length > 0) {
    return new Error('This account has already used a referral code')
  }

  // Get the referral code to get the referrer's user ID
  const [referralCode] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.id, referralUse.referralCodeId))
    .limit(1)

  if (!referralCode) return new Error('Referral code not found')

  // Apply the referral rewards via Stripe
  try {
    // Mark the referral as completed
    await db
      .update(referralUses)
      .set({
        completedAt: new Date(),
        accountId,
        updatedAt: new Date(),
      })
      .where(eq(referralUses.id, referralUse.id))

    // Get all active accounts where the referrer is an owner
    const referrerAccounts = await db
      .select({ id: accounts.id })
      .from(accounts)
      .innerJoin(accountUsers, eq(accounts.id, accountUsers.accountId))
      .where(
        and(
          eq(accountUsers.userId, referralCode.userId),
          eq(accountUsers.role, 'owner'),
          eq(accounts.isInactive, false),
        ),
      )

    // Apply rewards to both the referrer's active accounts and the referred account
    await Promise.all([
      ...referrerAccounts.map((account) => applyReferralReward(account.id)),
      applyReferralReward(accountId),
    ])

    return true
  } catch (error) {
    console.error('Failed to complete referral:', error)
    return new Error('Failed to complete referral')
  }
}

async function applyReferralReward(accountId: string): Promise<null | Error> {
  try {
    // Get the account's active subscription
    const [subscription] = await db
      .select({
        stripeId: subscriptions.stripeId,
        stripeCustomerId: subscriptions.stripeCustomerId,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.accountId, accountId), eq(subscriptions.status, 'active')))
      .limit(1)

    if (!subscription) {
      return new Error('No active subscription found')
    }

    const CREDIT_VALUE = 1000 // $10 in cents

    // Apply the credit to the customer's balance
    // The amount needs to be negative because negative customer balance means credit
    const customer = (await stripe.customers.retrieve(subscription.stripeCustomerId)) as Stripe.Customer
    await stripe.customers.update(subscription.stripeCustomerId, {
      balance: (customer.balance || 0) - CREDIT_VALUE,
    })

    return null
  } catch (error) {
    console.error('Failed to apply referral reward:', error)
    return new Error('Failed to apply referral reward')
  }
}
