'use client'
import { useReferralCode } from '@/hooks/use-referral-code'
import { REFERRAL_TEXT } from '@/modules/referral/text'

export default function ShowReferralMessage() {
  const { referralCode } = useReferralCode()

  if (!referralCode) return null

  return (
    <div className="my-6 p-4 bg-primary/10 rounded-lg">
      <p className="text-sm text-primary">{REFERRAL_TEXT.INVITED}</p>
    </div>
  )
}
