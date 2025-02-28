'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getActiveAccount, setActiveAccount } from '@/lib/activeAccount'
import { authorization } from '@/modules/account/actions'

type ActiveAccountContextType = {
  activeAccountId: string | undefined
  setActiveAccountId: (accountId: string) => Promise<void>
  isLoading: boolean
  ensureActiveAccount: () => Promise<void>
}

const ActiveAccountContext = createContext<ActiveAccountContextType | undefined>(undefined)

export function ActiveAccountProvider({ children }: { children: React.ReactNode }) {
  const [activeAccountId, setActiveAccountIdState] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  const ensureActiveAccount = async () => {
    try {
      // If there's already an active account, we're good
      const currentActiveAccount = await getActiveAccount()
      if (currentActiveAccount) {
        setActiveAccountIdState(currentActiveAccount)
        return
      }

      // Otherwise, try to get the user's accounts
      const auth = await authorization()
      if (auth instanceof Error) {
        console.error('Failed to get user accounts:', auth)
        return
      }

      // If they have accounts, set the first one as active
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

  return (
    <ActiveAccountContext.Provider
      value={{
        activeAccountId,
        setActiveAccountId,
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
