import Logo from '@/components/Logo'
import { Account } from './Account'
import Navigation from './Navigation'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="relative flex items-center gap-2">
          <Navigation />
          <Account />
        </div>
      </div>
    </header>
  )
}
