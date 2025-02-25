'use client'
import Link from 'next/link'
import { useState } from 'react'
import { signIn, useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, AlertCircle } from 'lucide-react'
import { menu } from '@/lib/menu'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'

export function Account() {
  const { status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const { activeAccountId, isLoading } = useActiveAccount()

  if (status === 'loading' || isLoading) {
    return (
      <Button variant="ghost" className="w-[120px]">
        Loading...
      </Button>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Button onClick={() => signIn()} className="w-[120px]">
        Sign In
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] translate-y-4">
          {!activeAccountId && (
            <DropdownMenuItem>
              <Link href={menu.onboarding.href} className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Finish Onboarding
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Link href={menu.account.href} className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              {menu.account.title}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={menu.user.href} className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              {menu.user.title}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              setIsOpen(false)
              signOut()
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
