'use server'
import { getActiveAccount } from '@/lib/activeAccount'
import { POI, POIProps } from './domain'
import { add, getAllByAccountId, remove } from './repo'
import { withReadAccess, withReadWriteAccess } from '@/modules/account/actions'

export async function addPOI(poiProps: POIProps) {
  const accountId = await getActiveAccount()
  if (!accountId) return new Error('No active account')

  const auth = await withReadWriteAccess(accountId)
  if (auth instanceof Error) return auth

  const poi = POI.createFromGooglePlace(accountId, poiProps)
  return await add(poi)
}

export async function removePOI(id: string) {
  const accountId = await getActiveAccount()
  if (!accountId) return new Error('No active account')

  const auth = await withReadWriteAccess(accountId)
  if (auth instanceof Error) return auth

  return await remove(id)
}

export async function getPOIs() {
  const accountId = await getActiveAccount()
  if (!accountId) return new Error('No active account')

  const auth = await withReadAccess(accountId)
  if (auth instanceof Error) return auth

  return await getAllByAccountId(accountId)
}
