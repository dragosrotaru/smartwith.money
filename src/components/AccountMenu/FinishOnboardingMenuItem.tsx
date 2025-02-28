'use client'
import Link from 'next/link'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { AlertCircle } from 'lucide-react'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import { menu } from '@/lib/menu'

export default function FinishOnboardingMenuItem() {
  const { activeAccountId, isLoading } = useActiveAccount()

  if (isLoading || activeAccountId) {
    return null
  }

  return (
    <DropdownMenuItem>
      <Link href={menu.onboarding.href} className="flex items-center">
        <AlertCircle className="mr-2 h-4 w-4" />
        Finish Onboarding
      </Link>
    </DropdownMenuItem>
  )
}
