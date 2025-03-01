'use client'

import { CreditCard } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createPortalSession } from '@/modules/billing/actions'
import { useSearchParams } from 'next/navigation'
import { useReferralCode } from '@/hooks/use-referral-code'
import { toast } from 'sonner'
import { processReferralCode } from '@/modules/referral/actions'
import { AccessAlert } from '@/components/AccessAlert'
import { useWithOwnerAccess } from '@/hooks/use-with-access'
import { SectionSkeleton } from './SectionSkeleton'

export function BillingSection({ accountId }: { accountId: string }) {
  const { isOwner, isLoadingAccess } = useWithOwnerAccess(accountId)
  const [loading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [referralCode, _, clearReferralCode] = useReferralCode()

  useEffect(() => {
    const handleSubscriptionStatus = async () => {
      const subscription = searchParams.get('subscription')
      const referralCode = searchParams.get('referral')

      if (subscription === 'success') {
        toast.success('Thank you for subscribing! Your subscription will be active shortly.')

        if (referralCode) {
          try {
            const error = await processReferralCode(referralCode)
            if (error instanceof Error) {
              toast.error(error.message)
            } else {
              clearReferralCode()
              toast.success('Referral bonus applied!')
            }
          } catch (error) {
            console.error('Error processing referral:', error)
            toast.error('Failed to process referral')
          }
        }
      } else if (subscription === 'cancelled') {
        toast.info('Subscription cancelled. You can upgrade anytime.')
      }
    }

    handleSubscriptionStatus()
  }, [searchParams, referralCode, clearReferralCode])

  const handleManageBilling = async () => {
    try {
      setIsLoading(true)
      const { url } = await createPortalSession(accountId)
      window.location.href = url
    } catch (error) {
      console.error('Failed to create portal session:', error)
      toast.error('Failed to manage billing')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingAccess) return <SectionSkeleton />
  if (!isOwner) return <AccessAlert message="Only account owners can manage billing." />

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
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
          {loading ? 'Loading...' : 'Manage Billing'}
        </Button>
      </div>
    </div>
  )
}
