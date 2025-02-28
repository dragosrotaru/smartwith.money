'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { acceptInvite, getPendingInvites, rejectInvite } from '@/modules/account/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'

type PendingInvite = {
  id: string
  accountId: string
  accountName: string
  role: string
}

export function InviteDialog() {
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [currentInvite, setCurrentInvite] = useState<PendingInvite | null>(null)
  const [loading, setLoading] = useState(false)
  const { setActiveAccountId } = useActiveAccount()

  useEffect(() => {
    const checkInvites = async () => {
      try {
        const result = await getPendingInvites()
        if (result instanceof Error) {
          console.error('Failed to fetch invites:', result)
          return
        }
        setInvites(result)
        if (result.length > 0) {
          setCurrentInvite(result[0])
        }
      } catch (error) {
        console.error('Failed to check invites:', error)
      }
    }

    checkInvites()
  }, [])

  const handleAccept = async () => {
    if (!currentInvite) return

    setLoading(true)
    try {
      const result = await acceptInvite(currentInvite.id)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }

      // Set this account as active
      await setActiveAccountId(currentInvite.accountId)

      toast.success('Invite accepted successfully')

      // Move to next invite or close dialog
      const nextInvite = invites.find((invite) => invite.id !== currentInvite.id)
      if (nextInvite) {
        setCurrentInvite(nextInvite)
      } else {
        setCurrentInvite(null)
      }
    } catch {
      toast.error('Failed to accept invite')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!currentInvite) return

    setLoading(true)
    try {
      const result = await rejectInvite(currentInvite.id)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }

      // Move to next invite or close dialog
      const nextInvite = invites.find((invite) => invite.id !== currentInvite.id)
      if (nextInvite) {
        setCurrentInvite(nextInvite)
      } else {
        setCurrentInvite(null)
      }
    } catch {
      toast.error('Failed to reject invite')
    } finally {
      setLoading(false)
    }
  }

  if (!currentInvite) return null

  return (
    <Dialog open={!!currentInvite} onOpenChange={() => setCurrentInvite(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Invitation</DialogTitle>
          <DialogDescription>
            You have been invited to join {currentInvite.accountName} as a {currentInvite.role}. Would you like to
            accept this invitation?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleReject} disabled={loading}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
