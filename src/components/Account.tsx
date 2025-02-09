'use client'

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
import { User, LogOut, Settings, CreditCard, UserPlus } from 'lucide-react'

export function Account() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (status === 'loading') {
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-[120px]">
          {session?.user?.name ?? 'Account'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem
          onClick={() => {
            /* Navigate to account page */
          }}
        >
          <User className="mr-2 h-4 w-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            /* Navigate to billing page */
          }}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            /* Navigate to settings page */
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            /* Navigate to invite friends page */
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Friends
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
  )
}
