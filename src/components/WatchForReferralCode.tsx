'use client'

import { useEffect, useState } from 'react'
import { useReferralCode } from '@/hooks/use-referral-code'
import { useBanner } from '@/contexts/BannerContext'
import { getAvailableReferral } from '@/modules/referral/actions'
import { createCheckoutSession } from '@/modules/billing/actions'
import { REFERRAL_TEXT } from '@/modules/referral/text'

export default function WatchForReferralCode() {
  const { showBanner } = useBanner()
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Handle referral code in URL
  useReferralCode()

  useEffect(() => {
    const checkForReferral = async () => {
      const referral = await getAvailableReferral()
      if (referral instanceof Error || !referral) return

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

      showBanner('floating', {
        id: 'referral-upgrade',
        message: REFERRAL_TEXT.REFERRAL_NOTIFICATION,
        variant: 'success',
        action: {
          label: isUpgrading ? 'Loading...' : 'Upgrade to Pro',
          onClick: handleUpgrade,
        },
      })
    }

    checkForReferral()
  }, [showBanner, isUpgrading])

  return null
}
