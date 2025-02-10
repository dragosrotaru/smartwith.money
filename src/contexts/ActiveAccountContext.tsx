'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getActiveAccount, setActiveAccount } from '@/lib/activeAccount'

type ActiveAccountContextType = {
  activeAccountId: string | undefined
  setActiveAccountId: (accountId: string) => Promise<void>
  isLoading: boolean
}

const ActiveAccountContext = createContext<ActiveAccountContextType | undefined>(undefined)

export function ActiveAccountProvider({ children }: { children: React.ReactNode }) {
  const [activeAccountId, setActiveAccountIdState] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadActiveAccount = async () => {
      try {
        const accountId = await getActiveAccount()
        setActiveAccountIdState(accountId)
      } catch (error) {
        console.error('Failed to load active account:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadActiveAccount()
  }, [])

  const setActiveAccountId = async (accountId: string) => {
    try {
      await setActiveAccount(accountId)
      setActiveAccountIdState(accountId)
    } catch (error) {
      console.error('Failed to set active account:', error)
      throw error
    }
  }

  return (
    <ActiveAccountContext.Provider
      value={{
        activeAccountId,
        setActiveAccountId,
        isLoading,
      }}
    >
      {children}
    </ActiveAccountContext.Provider>
  )
}

export function useActiveAccount() {
  const context = useContext(ActiveAccountContext)
  if (context === undefined) {
    throw new Error('useActiveAccount must be used within an ActiveAccountProvider')
  }
  return context
}
