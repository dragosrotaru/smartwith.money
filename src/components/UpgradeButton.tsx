'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { createCheckoutSession } from '@/modules/billing/actions'
import { useWithOwnerAccess } from '@/hooks/use-with-access'
import { useSubscription } from '@/contexts/SubscriptionContext'
export default function UpgradeButton() {
  const [isLoadingUpgrade, setIsLoadingUpgrade] = useState(false)
  const { isProMember, isLoading: isLoadingSubscription } = useSubscription()
  const { isOwner, isLoadingAccess } = useWithOwnerAccess()

  const isLoading = isLoadingUpgrade || isLoadingAccess || isLoadingSubscription
  const isDisabled = isLoading || !isOwner

  if (isProMember) return null

  const handleUpgrade = async () => {
    try {
      setIsLoadingUpgrade(true)
      const { url } = await createCheckoutSession()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoadingUpgrade(false)
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isDisabled}
      variant="default"
      className="w-full flex items-center justify-center gap-2"
    >
      <Sparkles className="h-4 w-4" />
      {isLoading ? 'Loading...' : 'Upgrade to Pro'}
    </Button>
  )
}
