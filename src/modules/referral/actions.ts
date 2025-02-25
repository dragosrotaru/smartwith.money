'use server'

import { auth } from '@/auth'
import { getOrCreateReferralCode, processReferral } from './service'

export async function generateReferralCode() {
  const session = await auth()
  if (!session) return new Error('Unauthorized')
  return await getOrCreateReferralCode(session.user.id)
}

export async function processReferralCode(code: string) {
  const session = await auth()
  if (!session) return new Error('Unauthorized')
  return await processReferral(code, session.user.id)
}
