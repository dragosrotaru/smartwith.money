import { withOwnerAccess, withReadAccess, withReadWriteAccess } from '@/modules/account/actions'
import { useState } from 'react'
import { useEffect } from 'react'

/* 

These hooks are used to determine if the user has the right access to the 
active account. They are meant to be used in client components for UI state,
not as guards for API calls.

*/

export function useWithOwnerAccess() {
  const [isOwner, setIsOwner] = useState(false)
  const [isLoadingAccess, setIsLoadingAccess] = useState(true)

  useEffect(() => {
    const ownerAccess = async () => {
      const auth = await withOwnerAccess()
      setIsOwner(auth instanceof Error ? false : true)
      setIsLoadingAccess(false)
    }
    ownerAccess()
  }, [])

  return { isOwner, isLoadingAccess }
}

export function useWithReadAccess() {
  const [isRead, setIsRead] = useState(false)
  const [isLoadingAccess, setIsLoadingAccess] = useState(true)

  useEffect(() => {
    const readAccess = async () => {
      const auth = await withReadAccess()
      setIsRead(auth instanceof Error ? false : true)
      setIsLoadingAccess(false)
    }
    readAccess()
  }, [])

  return { isRead, isLoadingAccess }
}

export function useWithReadWriteAccess() {
  const [isReadWriteAccess, setIsReadWriteAccess] = useState(false)
  const [isLoadingAccess, setIsLoadingAccess] = useState(true)

  useEffect(() => {
    const readWriteAccess = async () => {
      const auth = await withReadWriteAccess()
      setIsReadWriteAccess(auth instanceof Error ? false : true)
      setIsLoadingAccess(false)
    }
    readWriteAccess()
  }, [])

  return { isReadWriteAccess, isLoadingAccess }
}
