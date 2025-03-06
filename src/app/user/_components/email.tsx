'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateEmail, verifyEmail } from '@/modules/account/actions'
import { toast } from 'sonner'
import { menu } from '@/lib/menu'
import { useSession } from 'next-auth/react'

export default function EmailSettings() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
    }
  }, [session?.user?.email])

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim()

    if (trimmedEmail === session?.user?.email) {
      toast.error('Please enter a different email address')
      return
    }

    setIsLoading(true)
    const result = await updateEmail(trimmedEmail)
    if (result instanceof Error) {
      toast.error(result.message)
    } else {
      toast.success('Your email has been updated successfully. Please check your inbox for verification.')
      setEmail('')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    async function verifyEmailHandler() {
      const token = searchParams.get('token')
      if (token) {
        const result = await verifyEmail(token)
        if (result instanceof Error) {
          toast.error(result.message)
        } else {
          toast.success('Your email has been verified successfully.')
        }
        router.replace(menu.user.href)
      }
    }
    verifyEmailHandler()
  }, [searchParams, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.trim())
  }

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Email Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-muted">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Label>Email Address</Label>
              <p className="text-sm text-muted-foreground">Update your email address</p>
            </div>
          </div>

          {session?.user?.email && (
            <div className="text-sm text-muted-foreground mb-2">
              {session.user.emailVerified ? (
                <span className="text-green-600">(Verified)</span>
              ) : (
                <span className="text-yellow-600">(Not verified)</span>
              )}
            </div>
          )}

          <form onSubmit={handleUpdateEmail}>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter new email address"
                value={email}
                onChange={handleInputChange}
                required
              />
              <Button type="submit" disabled={isLoading || !email.trim() || email.trim() === session?.user?.email}>
                {isLoading ? 'Updating...' : 'Update Email'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  )
}
