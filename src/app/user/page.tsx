'use client'
import ThemeSettings from './_components/theme'
import ReferralSettings from './_components/referral'

export default function UserSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Settings</h1>

      <div className="space-y-6">
        <ReferralSettings />
        <ThemeSettings />
      </div>
    </div>
  )
}
