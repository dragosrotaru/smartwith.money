'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { authorization } from '@/modules/account/actions'
import { useEffect, useState } from 'react'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import Loader from '@/components/Loader'

type Account = {
  id: string
  name: string
  role: string
}

type SwitchAccountDialogProps = {
  trigger: React.ReactNode
}

export function SwitchAccountDialog({ trigger }: SwitchAccountDialogProps) {
  const { activeAccountId, setActiveAccountId } = useActiveAccount()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)

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

    if (open) {
      loadAccounts()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch Account</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader size={24} />
            </div>
          ) : (
            accounts.map((account) => (
              <Button
                key={account.id}
                variant={account.id === activeAccountId ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveAccountId(account.id)}
              >
                {account.id === activeAccountId && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" />}
                {account.name}
                {account.id === activeAccountId && (
                  <span className="ml-auto text-xs text-primary-foreground">Active</span>
                )}
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
