'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { setActiveAccount, clearActiveAccount as clearActiveAccountDb } from '@/modules/account/actions'
import { authorization } from '@/modules/account/actions'

/* 

This context is used to manage the current active account. It should not be used
to obtain the active account id since the server actions should be getting the 
active account id from the withXAccess methods.

*/

type ActiveAccountContextType = {
  activeAccountId: string | undefined
  setActiveAccountId: (accountId: string) => Promise<void>
  clearActiveAccount: () => Promise<void>
  isLoading: boolean
  ensureActiveAccount: () => Promise<void>
}

const ActiveAccountContext = createContext<ActiveAccountContextType | undefined>(undefined)

export function ActiveAccountProvider({ children }: { children: React.ReactNode }) {
  const [activeAccountId, setActiveAccountIdState] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  const ensureActiveAccount = async () => {
    try {
      const auth = await authorization()
      if (auth instanceof Error) return

      // If there's an active account in the database, verify it's still active
      if (auth.activeAccountId) {
        const account = auth.accounts.find((a) => a.id === auth.activeAccountId)
        if (!account) {
          // If current active account is inactive or not found, clear it
          await clearActiveAccountDb()
          setActiveAccountIdState(undefined)
        } else {
          setActiveAccountIdState(auth.activeAccountId)
          return
        }
      }

      // If they have active accounts but no active account set, set the first one as active
      if (auth.accounts.length > 0) {
        const firstAccount = auth.accounts[0]
        await setActiveAccount(firstAccount.id)
        setActiveAccountIdState(firstAccount.id)
      }
    } catch (error) {
      console.error('Failed to ensure active account:', error)
    }
  }

  useEffect(() => {
    const loadActiveAccount = async () => {
      try {
        await ensureActiveAccount()
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

  const clearActiveAccount = async () => {
    try {
      await clearActiveAccountDb()
      setActiveAccountIdState(undefined)
    } catch (error) {
      console.error('Failed to clear active account:', error)
      throw error
    }
  }

  return (
    <ActiveAccountContext.Provider
      value={{
        activeAccountId,
        setActiveAccountId,
        clearActiveAccount,
        isLoading,
        ensureActiveAccount,
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
