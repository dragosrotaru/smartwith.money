'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getSubscriptionStatus } from '@/modules/billing/actions'
import { useActiveAccount } from './ActiveAccountContext'
import { SubscriptionStatus } from '@/modules/billing/model'

type SubscriptionContextType = {
  isLoading: boolean
  isProMember: boolean
  status: SubscriptionStatus | null
  trialEndsAt: Date | null
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isProMember, setIsProMember] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const { activeAccountId } = useActiveAccount()

  useEffect(() => {
    const loadSubscription = async () => {
      if (status === 'loading' || !session?.user) {
        setIsLoading(false)
        return
      }

      if (!activeAccountId) {
        setIsLoading(false)
        return
      }

      try {
        const { isProMember: isPro, status, trialEndsAt } = await getSubscriptionStatus()
        console.log('isProMember', isPro)
        setIsProMember(isPro)
        setSubscriptionStatus(status)
        setTrialEndsAt(trialEndsAt ? new Date(trialEndsAt) : null)
      } catch (error) {
        console.error('Failed to load subscription:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscription()
  }, [session, status, activeAccountId])

  return (
    <SubscriptionContext.Provider
      value={{
        isLoading,
        isProMember,
        status: subscriptionStatus,
        trialEndsAt,
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
