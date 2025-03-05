'use server'
import { POI, POIProps } from './domain'
import { add, getAllByAccountId, remove } from './repo'
import { withReadAccess, withReadWriteAccess } from '@/modules/account/actions'

export async function addPOI(poiProps: POIProps) {
  const auth = await withReadWriteAccess()
  if (auth instanceof Error) return auth

  if (!auth.activeAccountId) return new Error('No active account')

  const poi = POI.createFromGooglePlace(auth.activeAccountId, poiProps)
  return await add(poi)
}

export async function removePOI(id: string) {
  const auth = await withReadWriteAccess()
  if (auth instanceof Error) return auth

  if (!auth.activeAccountId) return new Error('No active account')

  return await remove(id)
}

export async function getPOIs() {
  const auth = await withReadAccess()
  if (auth instanceof Error) return auth

  if (!auth.activeAccountId) return new Error('No active account')

  return await getAllByAccountId(auth.activeAccountId)
}
