'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Mortgage as MortgageModel,
  MortgageProps,
  PAYMENT_FREQUENCIES,
  PaymentFrequency,
  PROVINCES,
} from '@/modules/house/domain/mortgage'
import { Card, CardContent } from '@/components/ui/card'

export default function MortgageForm({
  setMortgage,
  initialParams,
}: {
  setMortgage: (mortgage: MortgageModel) => void
  initialParams: MortgageProps
}) {
  const [params, setParams] = useState<MortgageProps>(initialParams)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Updating mortgage model with:', params)
    setMortgage(new MortgageModel(params))
  }

  return (
    <Card>
      <CardContent className="my-4">
        <form onSubmit={handleSubmit} className="space-y-6 justify-between">
          <div>
            <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
            <Input
              id="purchasePrice"
              type="number"
              min={MortgageModel.MIN_PURCHASE_PRICE}
              value={params.purchasePrice}
              onChange={(e) => setParams({ ...params, purchasePrice: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              min={MortgageModel.MIN_INTEREST_RATE}
              max={MortgageModel.MAX_INTEREST_RATE}
              value={params.interestRate}
              onChange={(e) => setParams({ ...params, interestRate: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label htmlFor="amortizationYears">Amortization (Years)</Label>
            <Input
              id="amortizationYears"
              type="number"
              min={MortgageModel.MIN_AMORTIZATION_YEARS}
              max={MortgageModel.MAX_AMORTIZATION_YEARS}
              value={params.amortizationYears}
              onChange={(e) => setParams({ ...params, amortizationYears: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label htmlFor="paymentFrequency">Payment Frequency</Label>
            <Select
              value={params.paymentFrequency}
              onValueChange={(value: PaymentFrequency) => setParams({ ...params, paymentFrequency: value })}
            >
              <SelectTrigger id="paymentFrequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_FREQUENCIES.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isFirstTimeBuyer"
              checked={params.isFirstTimeBuyer}
              onCheckedChange={(checked) => setParams({ ...params, isFirstTimeBuyer: checked })}
            />
            <Label htmlFor="isFirstTimeBuyer">First Time Buyer</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isNewConstruction"
              disabled
              checked={params.isNewConstruction}
              onCheckedChange={(checked) => setParams({ ...params, isNewConstruction: checked })}
            />
            <Label htmlFor="isNewConstruction">New Construction</Label>
          </div>

          <div>
            <Label htmlFor="province">Province</Label>
            <Select
              value={params.province}
              disabled
              onValueChange={(value: string) => setParams({ ...params, province: value })}
            >
              <SelectTrigger id="province">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Run Model
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
