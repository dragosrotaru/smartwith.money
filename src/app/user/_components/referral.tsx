'use client'
import { Users, Copy, Check } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { generateReferralCode } from '@/modules/referral/actions'
import { redirect } from 'next/navigation'

export default function ReferralSettings() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchReferralCode() {
      const result = await generateReferralCode()
      if (result instanceof Error) {
        console.error('Error fetching referral code:', result)
      } else {
        setReferralCode(result)
      }
    }

    if (!session) redirect('/')
    fetchReferralCode()
  }, [session])

  const copyReferralLink = async () => {
    if (!referralCode) return

    const referralLink = `${window.location.origin}/login?ref=${referralCode}`
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Referral Program</h2>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-full bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <Label>Invite Friends</Label>
            <p className="text-sm text-muted-foreground">
              Share your referral link and both you and your friend get one month free!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
            {referralCode ? `${window.location.origin}/login?ref=${referralCode}` : 'Loading...'}
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={copyReferralLink}
            disabled={!referralCode}
            className="flex-shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
