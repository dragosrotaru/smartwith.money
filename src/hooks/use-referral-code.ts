'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { deleteCookie, useGetCookie, useSetCookie } from 'cookies-next'
import { REFERRAL_CODE_COOKIE_NAME } from '@/lib/constants'

export function useReferralCode() {
  const searchParams = useSearchParams()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const setCookie = useSetCookie()
  const getCookie = useGetCookie()

  useEffect(() => {
    // Check URL for referral code
    const code = searchParams.get('ref')
    if (code) {
      // Store in cookie for server-side access
      setCookie(REFERRAL_CODE_COOKIE_NAME, code, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
      setReferralCode(code)
    } else {
      // Check if we have a stored code
      const storedCode = getCookie(REFERRAL_CODE_COOKIE_NAME)
      if (storedCode) {
        setReferralCode(storedCode)
      }
    }
  }, [searchParams, setCookie, getCookie])

  const clearReferralCode = () => {
    deleteCookie(REFERRAL_CODE_COOKIE_NAME)
    setReferralCode(null)
  }

  return { referralCode, clearReferralCode }
}
