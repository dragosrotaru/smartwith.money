'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'

export function EnsureActiveAccount() {
  const { status } = useSession()
  const { ensureActiveAccount } = useActiveAccount()

  useEffect(() => {
    if (status === 'authenticated') {
      ensureActiveAccount()
    }
  }, [status, ensureActiveAccount])

  return null
}
