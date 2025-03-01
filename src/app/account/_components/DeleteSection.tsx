'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { deleteAccount, withOwnerAccess, submitAccountDeletionFeedback } from '@/modules/account/actions'
import { toast } from 'sonner'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const glowingButtonStyles = `
  shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_3px_#08f,0_0_30px_#08f]
  hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_10px_#08f,0_0_3px_#08f,0_0_3px_#08f]
  transition-shadow duration-300
`

export function DeleteSection({ accountId }: { accountId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [improvements, setImprovements] = useState('')
  const router = useRouter()
  const { clearActiveAccount } = useActiveAccount()

  useEffect(() => {
    async function checkAccess() {
      const auth = await withOwnerAccess(accountId)
      setIsOwner(!(auth instanceof Error))
      setIsLoading(false)
    }
    checkAccess()
  }, [accountId])

  const handleDelete = async () => {
    // Double check owner access before proceeding
    const auth = await withOwnerAccess(accountId)
    if (auth instanceof Error) {
      toast.error('You must be an owner to delete this account')
      return
    }

    setIsDeleting(true)
    try {
      // First submit feedback
      const feedbackResult = await submitAccountDeletionFeedback(accountId, reason, improvements)
      if (feedbackResult instanceof Error) throw feedbackResult

      // Then delete account
      const result = await deleteAccount(accountId)
      if (result instanceof Error) throw result

      toast.success('Account successfully deleted')

      // Clear active account and redirect
      await clearActiveAccount()
      router.push('/')
    } catch {
      toast.error('Failed to delete account. Please try again.')
      setIsOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!reason) {
      toast.error('Please tell us why you are considering leaving')
      return
    }

    setIsSubmittingFeedback(true)
    try {
      const result = await submitAccountDeletionFeedback(accountId, reason, improvements)
      if (result instanceof Error) throw result

      toast.success('Thank you for your feedback! We will be in touch shortly.')
      setIsOpen(false)
    } catch {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Only account owners can delete this account.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>We&apos;re Sad to See You Go 😢</DialogTitle>
          <DialogDescription className="pt-4">
            If you choose to share your thoughts with us instead of deleting your account right now, we&apos;ll get in
            touch and offer you 1-3 months free while we work to resolve your concerns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Why are you leaving?</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please tell us the main reason you want to delete your account..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvements">What could we do better?</Label>
            <Textarea
              id="improvements"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Any suggestions for how we could improve?"
              className="min-h-[100px]"
            />
          </div>
        </div>

        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Deleting your account will permanently remove all associated data and cancel any active subscriptions.
            Please make sure to export any data you want to keep before proceeding.
          </AlertDescription>
        </Alert>

        <DialogFooter className="flex-col gap-2 sm:gap-0">
          <div className="flex w-full flex-row gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isDeleting || isSubmittingFeedback}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSubmitFeedback}
              disabled={isSubmittingFeedback || isDeleting}
              className={cn('bg-background', !isSubmittingFeedback && !isDeleting && glowingButtonStyles)}
            >
              {isSubmittingFeedback ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Feedback...
                </>
              ) : (
                'Let us do better'
              )}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || isSubmittingFeedback}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
