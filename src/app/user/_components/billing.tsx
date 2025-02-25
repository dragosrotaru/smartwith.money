'use client'
import { CreditCard } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { createPortalSession } from '@/modules/billing/actions'

export default function BillingSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageBilling = async () => {
    try {
      setIsLoading(true)
      const { url } = await createPortalSession()
      window.location.href = url
    } catch (error) {
      console.error('Failed to create portal session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Billing</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
            <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <Label>Subscription & Billing</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your subscription and payment details</p>
          </div>
        </div>
        <Button onClick={handleManageBilling} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Manage Billing'}
        </Button>
      </div>
    </div>
  )
}
