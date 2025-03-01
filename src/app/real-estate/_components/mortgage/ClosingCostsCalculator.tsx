import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClosingCostsProps } from '@/modules/real-estate/domain/closingCosts'
import { ValueWithExplanation } from '@/components/ValueWithExplanation'
import React from 'react'

interface ClosingCostsCalculatorProps {
  closingCosts: ClosingCostsProps
  onUpdate: (closingCosts: ClosingCostsProps) => void
  onCancel?: () => void
}

interface CostInput {
  id: keyof ClosingCostsProps
  label: string
  explanation: string
}

const costInputs: CostInput[] = [
  {
    id: 'legalFees',
    label: 'Legal Fees',
    explanation: 'Fees charged by your lawyer for handling the legal aspects of your home purchase.',
  },
  {
    id: 'titleInsurance',
    label: 'Title Insurance',
    explanation: "Insurance that protects against losses related to the property's title or ownership.",
  },
  {
    id: 'appraisalFee',
    label: 'Appraisal Fee',
    explanation: 'Cost of having a professional appraiser assess the value of the property.',
  },
  {
    id: 'homeInspection',
    label: 'Home Inspection',
    explanation: "Fee for a professional inspection of the property's condition.",
  },
  {
    id: 'propertyTaxAdjustment',
    label: 'Property Tax Adjustment',
    explanation: 'Reimbursement to the seller for prepaid property taxes, prorated based on the closing date.',
  },
  {
    id: 'utilityAdjustments',
    label: 'Utility Adjustments',
    explanation: 'Reimbursement to the seller for prepaid utilities, prorated based on the closing date.',
  },
]

export function ClosingCostsCalculator({ closingCosts, onUpdate, onCancel }: ClosingCostsCalculatorProps) {
  const [values, setValues] = React.useState<ClosingCostsProps>(closingCosts)

  const handleInputChange = (id: keyof ClosingCostsProps, value: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: parseFloat(value) || 0,
    }))
  }

  const handleSave = () => {
    onUpdate(values)
  }

  const total = React.useMemo(() => {
    return Object.values(values).reduce((sum, value) => sum + value, 0)
  }, [values])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6">
        {costInputs.map(({ id, label, explanation }) => (
          <ValueWithExplanation key={id} label={label} value={values[id]} type="currency" explanation={explanation}>
            <Input
              type="number"
              value={values[id] || ''}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className="w-[200px]"
            />
          </ValueWithExplanation>
        ))}
      </div>

      <div className="border-t pt-6">
        <ValueWithExplanation
          label="Total Closing Costs"
          value={total}
          type="currency"
          explanation="Sum of all closing costs"
        />
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}
