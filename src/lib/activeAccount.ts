'use server'
import { cookies } from 'next/headers'

const ACTIVE_ACCOUNT_ID_KEY = 'activeAccountId'

export async function getActiveAccount(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(ACTIVE_ACCOUNT_ID_KEY)?.value
}

export async function setActiveAccount(accountId: string) {
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_ACCOUNT_ID_KEY, accountId, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  })
}

export async function clearActiveAccount() {
  const cookieStore = await cookies()
  cookieStore.delete(ACTIVE_ACCOUNT_ID_KEY)
}
