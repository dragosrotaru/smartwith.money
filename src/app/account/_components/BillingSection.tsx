'use client'

import { CreditCard, Sparkles } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createPortalSession } from '@/modules/billing/actions'
import { useSearchParams } from 'next/navigation'
import { useSubscription } from '@/contexts/SubscriptionContext'
import UpgradeButton from '@/components/UpgradeButton'

import { toast } from 'sonner'
import { completeReferralSubscription } from '@/modules/referral/actions'
import { AccessAlert } from '@/components/AccessAlert'
import { useWithOwnerAccess } from '@/hooks/use-with-access'
import { SectionSkeleton } from './SectionSkeleton'

export function BillingSection() {
  const { isOwner, isLoadingAccess } = useWithOwnerAccess()
  const [loading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const { isProMember, isLoading: isLoadingSubscription } = useSubscription()

  // This is for the callback from the billing portal
  useEffect(() => {
    const handleSubscriptionStatus = async () => {
      const subscription = searchParams.get('subscription')

      if (subscription === 'success') {
        toast.success('Thank you for subscribing! Your subscription will be active shortly.')

        try {
          // todo complete the referral in the webhook?
          const error = await completeReferralSubscription()
          if (error instanceof Error) {
            toast.error(error.message)
          } else {
            toast.success('Referral bonus applied!')
          }
        } catch (error) {
          console.error('Error processing referral:', error)
          toast.error('Failed to process referral')
        }
      } else if (subscription === 'cancelled') {
        toast.info('Subscription cancelled. You can upgrade anytime.')
      }
    }

    handleSubscriptionStatus()
  }, [searchParams])

  const handleManageBilling = async () => {
    setIsLoading(true)
    try {
      const result = await createPortalSession()
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      window.location.href = result.url
    } catch {
      toast.error('Failed to open billing portal')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingAccess || isLoadingSubscription) return <SectionSkeleton />
  if (!isOwner) return <AccessAlert message="Only account owners can manage billing." />

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
              <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <Label>Subscription & Billing</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your subscription and payment details</p>
            </div>
          </div>
          <Button onClick={handleManageBilling} disabled={loading}>
            {loading ? 'Opening Portal...' : 'Manage Billing'}
          </Button>
        </div>
        {!isProMember && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <Label>Upgrade to Pro</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get access to advanced features and unlimited usage
                  </p>
                </div>
              </div>
              <div className="w-[140px]">
                <UpgradeButton />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
