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
import { LogOut, User, Settings, ArrowLeftRight } from 'lucide-react'
import { menu } from '@/lib/menu'
import UpgradeMenuItem from './UpgradeMenuItem'
import FinishOnboardingMenuItem from './FinishOnboardingMenuItem'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import { SwitchAccountDialog } from '@/app/account/_components/SwitchAccountDialog'

export default function AccountMenu() {
  const { data: session, status } = useSession()
  const { activeAccount } = useActiveAccount()
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
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? ''} />
              <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image ?? undefined} />
              <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium leading-none">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
          {activeAccount && (
            <>
              <DropdownMenuSeparator className="my-1" />
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" />
                    <p className="text-xs font-medium text-muted-foreground">Active Account</p>
                  </div>
                  <SwitchAccountDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                      </Button>
                    }
                  />
                </div>
                <p className="text-sm font-medium pl-3.5">{activeAccount.name}</p>
              </div>
            </>
          )}
          <DropdownMenuSeparator />
          <FinishOnboardingMenuItem />
          <UpgradeMenuItem />
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
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault()
              signOut({
                callbackUrl: `${window.location.origin}${menu.signin.href}`,
              })
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
