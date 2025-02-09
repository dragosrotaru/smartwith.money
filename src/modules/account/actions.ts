'use server'
import { auth } from '@/auth'
import { getUserAndAccounts } from './repo'

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
