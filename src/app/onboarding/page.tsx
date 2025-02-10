import { authorization } from '@/modules/account/actions'
import OnboardingContainer from './container'
import { redirect } from 'next/navigation'

export default async function Onboarding() {
  const auth = await authorization()
  if (auth instanceof Error) redirect('/login')

  if (auth.accounts.length > 0) redirect('/')

  return <OnboardingContainer />
}
