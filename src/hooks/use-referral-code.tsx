export function useReferralCode(): [string | null, (code: string) => void, () => void] {
  const referralCode = sessionStorage.getItem('referralCode')
  const setReferralCode = (code: string) => {
    sessionStorage.setItem('referralCode', code)
  }
  const clearReferralCode = () => {
    sessionStorage.removeItem('referralCode')
  }
  return [referralCode, setReferralCode, clearReferralCode]
}
