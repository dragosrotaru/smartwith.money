'use client'
import { useReferralCode } from '@/hooks/use-referral-code'

export default function ShowReferralMessage() {
  const { referralCode } = useReferralCode()

  if (!referralCode) return null

  return (
    <div className="my-6 p-4 bg-primary/10 rounded-lg">
      <p className="text-sm text-primary">
        You&apos;ve been invited! If you decide to upgrade later, you and your friend will get one month free, on top of
        our 1 month free trial.
      </p>
    </div>
  )
}
