import { withOwnerAccess, withReadAccess, withReadWriteAccess } from '@/modules/account/actions'
import { useState } from 'react'
import { useEffect } from 'react'

export function useWithOwnerAccess(accountId: string) {
  const [isOwner, setIsOwner] = useState(false)
  const [isLoadingAccess, setIsLoadingAccess] = useState(true)

  useEffect(() => {
    const ownerAccess = async () => {
      const auth = await withOwnerAccess(accountId)
      setIsOwner(auth instanceof Error ? false : true)
      setIsLoadingAccess(false)
    }
    ownerAccess()
  }, [accountId])

  return { isOwner, isLoadingAccess }
}

export function useWithReadAccess(accountId: string) {
  const [isRead, setIsRead] = useState(false)
  const [isLoadingAccess, setIsLoadingAccess] = useState(true)

  useEffect(() => {
    const readAccess = async () => {
      const auth = await withReadAccess(accountId)
      setIsRead(auth instanceof Error ? false : true)
      setIsLoadingAccess(false)
    }
    readAccess()
  }, [accountId])

  return { isRead, isLoadingAccess }
}

export function useWithReadWriteAccess(accountId: string) {
  const [isReadWriteAccess, setIsReadWriteAccess] = useState(false)
  const [isLoadingAccess, setIsLoadingAccess] = useState(true)

  useEffect(() => {
    const readWriteAccess = async () => {
      const auth = await withReadWriteAccess(accountId)
      setIsReadWriteAccess(auth instanceof Error ? false : true)
      setIsLoadingAccess(false)
    }
    readWriteAccess()
  }, [accountId])

  return { isReadWriteAccess, isLoadingAccess }
}
