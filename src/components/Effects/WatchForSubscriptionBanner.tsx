'use client'

import { useEffect } from 'react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useBanner } from '@/contexts/BannerContext'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import { createPortalSession } from '@/modules/billing/actions'

export default function WatchForSubscriptionBanner() {
  const { status, trialEndsAt } = useSubscription()
  const { showBanner } = useBanner()
  const { activeAccountId } = useActiveAccount()

  useEffect(() => {
    if (!activeAccountId) return

    // Show trial ending banner if trial ends in less than 3 days
    if (status === 'trialing' && trialEndsAt) {
      const daysUntilTrialEnds = Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      if (daysUntilTrialEnds <= 3) {
        showBanner('header', {
          id: 'trial-ending',
          message: `Your trial ends in ${daysUntilTrialEnds} day${daysUntilTrialEnds === 1 ? '' : 's'}. Upgrade to Pro to keep your benefits.`,
          variant: 'warning',
          action: {
            label: 'Upgrade Now',
            onClick: async () => {
              try {
                const result = await createPortalSession()
                if (result instanceof Error) throw result
                window.location.href = result.url
              } catch (error) {
                console.error('Failed to open billing portal:', error)
              }
            },
          },
        })
      }
    }

    // Show payment failed banner
    if (status === 'past_due' || status === 'incomplete') {
      showBanner('header', {
        id: 'payment-failed',
        message:
          'We were unable to process your payment. Please update your payment method to continue your subscription.',
        variant: 'error',
        action: {
          label: 'Update Payment',
          onClick: async () => {
            try {
              const result = await createPortalSession()
              if (result instanceof Error) throw result
              window.location.href = result.url
            } catch (error) {
              console.error('Failed to open billing portal:', error)
            }
          },
        },
      })
    }
  }, [activeAccountId, showBanner, status, trialEndsAt])

  return null
}
