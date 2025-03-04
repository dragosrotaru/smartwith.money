'use server'

import { auth } from '@/auth'
import { recordReferralUse, completeReferralUse } from './service'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { referralCodes, referralUses } from './model'
import { and, eq, isNull, sql } from 'drizzle-orm'

export async function getOrCreateReferralCode(): Promise<string | Error> {
  const session = await auth()
  if (!session) return new Error('Unauthorized')

  const codes = await db
    .select()
    .from(referralCodes)
    .where(and(eq(referralCodes.userId, session.user.id), eq(referralCodes.active, true)))

  if (codes.length > 0) return codes[0].code

  // Generate a unique referral code
  const code = nanoid(8)

  // Create an active referral code
  await db.insert(referralCodes).values({
    userId: session.user.id,
    code,
    active: true,
  })

  return code
}

/**
 * Records a referral use during signup
 */
export async function recordReferralSignup(code: string) {
  const session = await auth()
  if (!session) return new Error('Unauthorized')
  return await recordReferralUse(code, session.user.id)
}

/**
 * Completes a referral use when subscribing to an account
 */
export async function completeReferralSubscription(accountId: string) {
  const session = await auth()
  if (!session) return new Error('Unauthorized')
  return await completeReferralUse(session.user.id, accountId)
}

/**
 * Gets all referral uses for the current user's referral code
 */
export async function getReferralUses() {
  const session = await auth()
  if (!session) return new Error('Unauthorized')

  const referralData = await db
    .select({
      referralUse: referralUses,
      code: referralCodes.code,
    })
    .from(referralCodes)
    .leftJoin(referralUses, eq(referralUses.referralCodeId, referralCodes.id))
    .where(eq(referralCodes.userId, session.user.id))

  return referralData
}

/**
 * Gets any available (unused) referral code for the current user
 */
export async function getAvailableReferral() {
  const session = await auth()
  if (!session) return new Error('Unauthorized')

  const referral = await db
    .select()
    .from(referralUses)
    .where(and(eq(referralUses.referredUserId, session.user.id), isNull(referralUses.completedAt)))
    .limit(1)

  if (referral.length === 0) return null

  const code = await db.select().from(referralCodes).where(eq(referralCodes.id, referral[0].referralCodeId)).limit(1)

  return code[0]
}
