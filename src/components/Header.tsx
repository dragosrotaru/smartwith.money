'use client'
import Logo from '@/components/Logo'
import AccountMenu from './AccountMenu'
import Navigation from './Navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useSidebar } from './ui/sidebar'

export function Header() {
  const { openMobile, setOpenMobile } = useSidebar()
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-2">
        <div className="flex items-center">
          <Link className="hidden md:block" href="/">
            <Logo />
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpenMobile(!openMobile)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
        <div className="relative flex items-center gap-2">
          <Navigation />
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
