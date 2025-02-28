'use client'

import { useState } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Sparkles } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { createCheckoutSession } from '@/modules/billing/actions'

export default function UpgradeMenuItem() {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const { isProMember, isLoading } = useSubscription()

  if (isLoading || isProMember) {
    return null
  }

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true)
      const { url } = await createCheckoutSession()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <DropdownMenuItem onClick={handleUpgrade} disabled={isUpgrading} className="flex items-center cursor-pointer">
      <Sparkles className="h-4 w-4" />
      {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
    </DropdownMenuItem>
  )
}
