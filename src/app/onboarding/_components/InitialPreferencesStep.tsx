'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { FormDataProps } from '../formData'
import { PROVINCE_MAP } from '@/modules/location/provinces'

const priorities = [
  'Finding a home you love',
  'Maximizing net worth',
  'Rental income',
  'DIY/flip potential',
  'Location (proximity to POIs)',
  'Affordability',
  'Home appreciation',
  'Tax benefits',
]

export default function InitialPreferencesStep({
  formData,
  updateFormData,
}: {
  formData: FormDataProps
  updateFormData: (data: Partial<FormDataProps>) => void
}) {
  const [rankedPriorities, setRankedPriorities] = useState(
    formData.priorities.length ? formData.priorities : priorities,
  )

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newPriorities = [...rankedPriorities]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newPriorities[index], newPriorities[newIndex]] = [newPriorities[newIndex], newPriorities[index]]
    setRankedPriorities(newPriorities)
    updateFormData({ priorities: newPriorities })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Initial Preferences</h2>
        <p className="text-muted-foreground">Let&apos;s get to know your home buying preferences.</p>
      </div>

      {/* Province Selection */}
      <div className="space-y-2">
        <Label htmlFor="province">Select your province of interest</Label>
        <Select value={formData.province} onValueChange={(value) => updateFormData({ province: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a province" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROVINCE_MAP).map(([province, name]) => (
              <SelectItem key={province} value={province}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Home Buyer Status */}
      <div className="space-y-2">
        <Label>First-Time Home Buyer Status</Label>
        <RadioGroup
          value={formData.isFirstTimeHomeBuyer ? 'true' : 'false'}
          onValueChange={(value) => updateFormData({ isFirstTimeHomeBuyer: value === 'true' })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="first-time-yes" />
            <Label htmlFor="first-time-yes">Yes, I&apos;m a first-time home buyer</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="first-time-no" />
            <Label htmlFor="first-time-no">No, I&apos;ve owned a home before</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Priorities Ranking */}
      <div className="space-y-4">
        <Label>Rank Your Priorities</Label>
        <p className="text-sm text-muted-foreground">
          Use the arrows to rank these factors in order of importance to you:
        </p>
        <ul className="space-y-2">
          {rankedPriorities.map((priority, index) => (
            <li key={priority} className="flex items-center space-x-2 rounded-lg border p-2">
              <span className="font-semibold">{index + 1}.</span>
              <span>{priority}</span>
              <div className="ml-auto space-x-1">
                {index > 0 && (
                  <Button size="sm" variant="outline" onClick={() => movePriority(index, 'up')}>
                    ↑
                  </Button>
                )}
                {index < priorities.length - 1 && (
                  <Button size="sm" variant="outline" onClick={() => movePriority(index, 'down')}>
                    ↓
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
