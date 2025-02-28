'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getSubscriptionStatus } from '@/modules/billing/actions'

type SubscriptionContextType = {
  isLoading: boolean
  isProMember: boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isProMember, setIsProMember] = useState(false)

  useEffect(() => {
    const loadSubscription = async () => {
      if (status === 'loading' || !session?.user) {
        setIsLoading(false)
        return
      }

      try {
        const { isProMember: isPro } = await getSubscriptionStatus()
        setIsProMember(isPro)
      } catch (error) {
        console.error('Failed to load subscription:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscription()
  }, [session, status])

  return (
    <SubscriptionContext.Provider
      value={{
        isLoading,
        isProMember,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
