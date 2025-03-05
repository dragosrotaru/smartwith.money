'use server'
import { recordReferralUse, completeReferralUse } from './service'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { referralCodes, referralUses } from './model'
import { and, eq, isNull } from 'drizzle-orm'
import { authorization, withOwnerAccess } from '../account/actions'

export async function getOrCreateReferralCode(): Promise<string | Error> {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  const codes = await db
    .select()
    .from(referralCodes)
    .where(and(eq(referralCodes.userId, auth.user.id), eq(referralCodes.active, true)))

  if (codes.length > 0) return codes[0].code

  // Generate a unique referral code
  const code = nanoid(8)

  // Create an active referral code
  await db.insert(referralCodes).values({
    userId: auth.user.id,
    code,
    active: true,
  })

  return code
}

/**
 * Records a referral use during signup
 */
export async function recordReferralSignup(code: string) {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  return await recordReferralUse(code, auth.user.id)
}

/**
 * Completes a referral use when subscribing to an account
 */
export async function completeReferralSubscription() {
  const auth = await withOwnerAccess()
  if (auth instanceof Error) return auth

  return await completeReferralUse(auth.user.id, auth.activeAccountId)
}

/**
 * Gets all referral uses for the current user's referral code
 */
export async function getReferralUses() {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  const referralData = await db
    .select({
      referralUse: referralUses,
      code: referralCodes.code,
    })
    .from(referralCodes)
    .leftJoin(referralUses, eq(referralUses.referralCodeId, referralCodes.id))
    .where(eq(referralCodes.userId, auth.user.id))

  return referralData
}

/**
 * Gets any available (unused) referral code for the current user
 */
export async function getAvailableReferral() {
  const auth = await authorization()
  if (auth instanceof Error) return auth

  const referral = await db
    .select()
    .from(referralUses)
    .where(and(eq(referralUses.referredUserId, auth.user.id), isNull(referralUses.completedAt)))
    .limit(1)

  if (referral.length === 0) return null

  const code = await db.select().from(referralCodes).where(eq(referralCodes.id, referral[0].referralCodeId)).limit(1)

  return code[0]
}
