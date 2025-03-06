'use client'
import ThemeSettings from './_components/theme'
import ReferralSettings from './_components/referral'
import EmailSettings from './_components/email'
import ProfileSettings from './_components/profile'

export default function UserSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Settings</h1>

      <div className="space-y-6">
        <EmailSettings />
        <ProfileSettings />
        <ReferralSettings />
        <ThemeSettings />
      </div>
    </div>
  )
}
