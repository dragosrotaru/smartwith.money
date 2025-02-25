'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { FormDataProps } from './formData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InvitePeopleStep from './_components/InvitePeopleStep'
import AccountNameStep from './_components/AccountNameStep'
import InitialPreferencesStep from './_components/InitialPreferencesStep'
import { processReferralCode } from '@/modules/referral/actions'
import { useReferralCode } from '@/hooks/use-referral-code'

export default function OnboardingContainer() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [referralCode, _, clearReferralCode] = useReferralCode()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormDataProps>({
    accountName: '',
    invitedPeople: [],
    isFirstTimeHomeBuyer: false,
    province: '',
    priorities: [],
  })

  useEffect(() => {
    async function processReferral() {
      if (!referralCode) return
      // todo this isn't right because the user wont be signed up on stripe yet
      const result = await processReferralCode(referralCode)
      if (result instanceof Error) {
        console.error('Error processing referral:', result)
      } else {
        clearReferralCode()
      }
    }

    processReferral()
  }, [referralCode, clearReferralCode])

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return formData.accountName.trim().length > 0
      case 2:
        // Allow empty invites, but if there are invites, they must be valid
        return formData.invitedPeople.every(
          (person) => person.email.includes('@') && person.email.includes('.') && person.role,
        )
      case 3:
        return formData.province && typeof formData.isFirstTimeHomeBuyer === 'boolean'
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <AccountNameStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return <InvitePeopleStep formData={formData} updateFormData={updateFormData} />
      case 3:
        return <InitialPreferencesStep formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  const handleSubmit = async () => {
    if (!isStepComplete()) return
    console.log('Form submitted:', formData)
    // Here you would typically send the data to your backend
  }

  return (
    <div>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create Your First Account</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button onClick={prevStep} variant="outline">
                Previous
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={nextStep} className="ml-auto" disabled={!isStepComplete()}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="ml-auto" disabled={!isStepComplete()}>
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
