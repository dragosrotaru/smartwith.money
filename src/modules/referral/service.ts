import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { referralCodes, referralUses } from './model'
import { stripe } from '@/modules/billing/stripe'
import { nanoid } from 'nanoid'

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const existingReferrals = await getReferralsByUser(userId)
  const activeReferral = existingReferrals.find((r) => r.active === true)

  if (activeReferral) return activeReferral.code

  // Generate a unique referral code
  const code = nanoid(8)

  // Create an active referral code
  await db.insert(referralCodes).values({
    userId,
    code,
    active: true,
  })

  return code
}

export async function getReferralsByUser(userId: string) {
  const codes = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .leftJoin(referralUses, eq(referralCodes.id, referralUses.referralCodeId))

  return codes.map(({ referral_codes, referral_uses }) => ({
    ...referral_codes,
    uses: referral_uses ? [referral_uses] : [],
  }))
}

export async function processReferral(code: string, newUserId: string): Promise<null | Error> {
  // First check if the user has already used any referral code
  const existingReferrals = await db
    .select()
    .from(referralUses)
    .where(eq(referralUses.referredUserId, newUserId))
    .limit(1)

  if (existingReferrals.length > 0) {
    return new Error('You have already used a referral code')
  }

  // Get the referral code
  const [referralCode] = await db
    .select()
    .from(referralCodes)
    .where(and(eq(referralCodes.code, code), eq(referralCodes.active, true)))
    .limit(1)

  if (!referralCode) {
    return new Error('Invalid or inactive referral code')
  }

  // Prevent self-referral
  if (referralCode.userId === newUserId) {
    return new Error('You cannot use your own referral code')
  }

  // Record the referral use
  await db.insert(referralUses).values({
    referralCodeId: referralCode.id,
    referredUserId: newUserId,
  })

  // Apply the free month to both users via Stripe
  const referralReward = await applyReferralReward(referralCode.userId)
  const newUserReward = await applyReferralReward(newUserId)

  if (referralReward instanceof Error) return referralReward
  if (newUserReward instanceof Error) return newUserReward

  return null
}

async function applyReferralReward(userId: string): Promise<null | Error> {
  try {
    // Get user's active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: userId,
      status: 'active',
      limit: 1,
    })

    // if no subscription exist, the user doesn't get a reward but its not an error
    if (subscriptions.data.length === 0) return null

    const subscription = subscriptions.data[0]

    // Add a one month free trial coupon
    await stripe.subscriptions.update(subscription.id, {
      trial_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      proration_behavior: 'none',
    })

    return null
  } catch (error) {
    console.error('Error applying referral reward:', error)
    return new Error('Error applying referral reward')
  }
}
