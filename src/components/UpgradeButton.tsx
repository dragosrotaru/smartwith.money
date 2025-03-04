'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { createCheckoutSession } from '@/modules/billing/actions'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
export default function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { activeAccountId } = useActiveAccount()

  if (!activeAccountId) return null

  const handleUpgrade = async () => {
    try {
      setIsLoading(true)
      const { url } = await createCheckoutSession(activeAccountId)
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isLoading}
      variant="default"
      className="w-full flex items-center justify-center gap-2"
    >
      <Sparkles className="h-4 w-4" />
      {isLoading ? 'Loading...' : 'Upgrade to Pro'}
    </Button>
  )
}
