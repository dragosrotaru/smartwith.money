'use client'
import { Users, Copy, Check, Gift } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getOrCreateReferralCode, getReferralUses, getAvailableReferral } from '@/modules/referral/actions'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import type { ReferralCode } from '@/modules/referral/model'

interface ReferralUse {
  referralUse: {
    completedAt: Date | null
  } | null
  code: string
}

export default function ReferralSettings() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralUses, setReferralUses] = useState<ReferralUse[]>([])
  const [availableReferral, setAvailableReferral] = useState<ReferralCode | null>(null)
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState<string>('')
  const { data: session } = useSession()

  useEffect(() => {
    if (referralCode) {
      setReferralLink(`${window.location.origin}/?ref=${referralCode}`)
    }
  }, [referralCode])

  useEffect(() => {
    async function fetchData() {
      if (!session) return

      const [codeResult, usesResult, availableResult] = await Promise.all([
        getOrCreateReferralCode(),
        getReferralUses(),
        getAvailableReferral(),
      ])

      if (!(codeResult instanceof Error)) {
        setReferralCode(codeResult)
      }
      if (!(usesResult instanceof Error)) {
        const uses = usesResult.filter((use) => use.referralUse?.completedAt)
        setReferralUses(uses)
      }
      if (!(availableResult instanceof Error)) {
        setAvailableReferral(availableResult)
      }
    }

    if (!session) redirect('/')
    fetchData()
  }, [session])

  const copyReferralLink = async () => {
    if (!referralCode) return

    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Invite Friends Section */}
        <div>
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
                {referralCode ? referralLink : 'Loading...'}
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

        {/* Available Referral Section */}
        {availableReferral && (
          <>
            <div className="h-px bg-border" />
            <div className="rounded-lg border-2 border-primary p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">You have an unused referral!</h3>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to any plan to get one month free with referral code: {availableReferral.code}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Referral Uses Section */}
        {referralUses.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div>
              <h3 className="text-lg font-semibold mb-4">Referral Credits</h3>
              <div className="space-y-3">
                {referralUses.map((use, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-green-600 font-medium">Credit Applied +$10</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(use.referralUse!.completedAt!).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
