import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OnboardingData } from '@/modules/account/actions'

export default function AccountNameStep({
  formData,
  updateFormData,
}: {
  formData: OnboardingData
  updateFormData: (data: Partial<OnboardingData>) => void
}) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Account Name</h2>
      <p className="text-sm text-gray-500">
        You can create multiple accounts to manage data separately and invite people to collaborate with you.
      </p>
      <div className="space-y-2">
        <Label htmlFor="accountName">Give your account a name</Label>
        <Input
          id="accountName"
          value={formData.accountName}
          onChange={(e) => updateFormData({ accountName: e.target.value })}
          placeholder="e.g., Smith Family"
        />
      </div>
    </div>
  )
}
