'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SwitchCamera } from 'lucide-react'
import { authorization } from '@/modules/account/actions'
import { useEffect, useState } from 'react'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'

type Account = {
  id: string
  name: string
  role: string
}

export function SwitchAccountDialog() {
  const { activeAccountId, setActiveAccountId } = useActiveAccount()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const auth = await authorization()
        if (auth instanceof Error) {
          console.error('Failed to load accounts:', auth)
          return
        }
        setAccounts(auth.accounts)
      } catch (error) {
        console.error('Failed to load accounts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAccounts()
  }, [])

  if (isLoading) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start gap-2 w-full">
          <SwitchCamera className="mr-2 h-4 w-4" />
          Switch Active Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch Account</DialogTitle>
          <DialogDescription>Select an account to switch to or create a new one.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {accounts.map((account) => (
            <Button
              key={account.id}
              variant={account.id === activeAccountId ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setActiveAccountId(account.id)}
            >
              {account.name}
              {account.id === activeAccountId && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
