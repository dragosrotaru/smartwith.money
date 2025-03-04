'use client'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InvitePeopleStep from './_components/InvitePeopleStep'
import AccountNameStep from './_components/AccountNameStep'
import InitialPreferencesStep from './_components/InitialPreferencesStep'
import { completeOnboarding, OnboardingData } from '@/modules/account/actions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'

export default function OnboardingContainer() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasPersonFilledButNotAdded, setHasPersonFilledButNotAdded] = useState(false)
  const router = useRouter()
  const { setActiveAccountId } = useActiveAccount()
  const [formData, setFormData] = useState<OnboardingData>({
    accountName: '',
    invitedPeople: [],
    isFirstTimeHomeBuyer: false,
    province: 'ON',
    priorities: [],
  })

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const isStepComplete = useCallback(() => {
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
  }, [formData, step])

  const nextStep = useCallback(() => {
    if (step === 2 && hasPersonFilledButNotAdded) {
      toast.error('Did you forget to click "Add Person"? Click the button or clear the field and try again.')
      return
    }
    if (step < 3 && isStepComplete()) {
      setStep(step + 1)
    }
  }, [step, hasPersonFilledButNotAdded, isStepComplete])

  const handleSubmit = useCallback(async () => {
    if (!isStepComplete()) return

    setIsSubmitting(true)
    try {
      const result = await completeOnboarding(formData)

      if (result instanceof Error) {
        toast.error(result.message)
        return
      }

      // Set the newly created account as active
      await setActiveAccountId(result.accountId)

      toast.success('Your account has been created successfully!')
      router.push('/')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, setActiveAccountId, router, isStepComplete])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey && !isSubmitting) {
        if (step === 3 && isStepComplete()) {
          handleSubmit()
        } else {
          nextStep()
        }
      }
    },
    [step, isStepComplete, isSubmitting, handleSubmit, nextStep],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  const renderStep = () => {
    switch (step) {
      case 1:
        return <AccountNameStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return (
          <InvitePeopleStep
            formData={formData}
            updateFormData={updateFormData}
            onPersonFilledButNotAdded={setHasPersonFilledButNotAdded}
          />
        )
      case 3:
        return <InitialPreferencesStep formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
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
              <Button onClick={prevStep} variant="outline" disabled={isSubmitting}>
                Previous
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={nextStep} className="ml-auto" disabled={!isStepComplete() || isSubmitting}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="ml-auto" disabled={!isStepComplete() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
