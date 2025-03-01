'use client'
import { useState, type FormEvent, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Mortgage as MortgageModel,
  MortgageProps,
  PAYMENT_FREQUENCIES,
  PaymentFrequency,
} from '@/modules/real-estate/domain/mortgage'
import { Card, CardContent } from '@/components/ui/card'
import { ClosingCostsProps } from '@/modules/real-estate/domain/closingCosts'
import { ClosingCostsDialog } from './ClosingCostsDialog'
import { ValueWithExplanation } from '@/components/ValueWithExplanation'
import { Province, PROVINCES } from '@/modules/location/provinces'

export default function MortgageForm({
  setMortgage,
  mortgage,
}: {
  setMortgage: (mortgage: MortgageModel) => void
  mortgage: MortgageModel
}) {
  const [params, setParams] = useState<MortgageProps>(mortgage)

  // Calculate mortgage-related values
  const mortgageModel = useMemo(() => new MortgageModel(params), [params])
  const minDownPaymentPercent = (mortgageModel.minDownPayment / params.purchasePrice) * 100
  const currentDownPaymentPercent = ((params.downPayment || mortgageModel.minDownPayment) / params.purchasePrice) * 100
  const insurancePremium = mortgageModel.mortgageInsurance.premium

  // Simple formatters/parsers
  const formatNumber = (value: number) => value.toLocaleString('en-US')
  const parseNumber = (value: string) => parseFloat(value.replace(/,/g, '')) || 0

  // Input values for display
  const [inputValues, setInputValues] = useState({
    purchasePrice: formatNumber(params.purchasePrice),
    downPayment: formatNumber(params.downPayment || params.purchasePrice * 0.05),
    interestRate: params.interestRate.toFixed(2),
    amortizationYears: params.amortizationYears.toString(),
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMortgage(new MortgageModel(params))
  }
  const handleClosingCostsUpdate = (closingCosts: ClosingCostsProps) => {
    setParams({ ...params, closingCosts })
  }

  // Purchase price handlers
  const handlePurchasePriceChange = (value: string) => {
    setInputValues({ ...inputValues, purchasePrice: value })
  }
  const handlePurchasePriceBlur = () => {
    const newPrice = Math.max(parseNumber(inputValues.purchasePrice), MortgageModel.MIN_PURCHASE_PRICE)
    const updatedParams = {
      ...params,
      purchasePrice: newPrice,
    }

    const tempModel = new MortgageModel({ ...updatedParams, downPayment: undefined })
    // ALWAYS set down payment to the minimum amount
    updatedParams.downPayment = tempModel.minDownPayment

    setParams(updatedParams)
    setInputValues({
      ...inputValues,
      purchasePrice: formatNumber(newPrice),
      downPayment: formatNumber(updatedParams.downPayment),
    })
  }

  // Down payment handlers
  const handleDownPaymentChange = (value: string) => {
    setInputValues({ ...inputValues, downPayment: value })
  }
  const handleDownPaymentBlur = () => {
    const parsedValue = parseNumber(inputValues.downPayment)
    const newDownPayment = Math.min(Math.max(parsedValue, mortgageModel.minDownPayment), params.purchasePrice)
    setParams({ ...params, downPayment: newDownPayment })
    setInputValues({ ...inputValues, downPayment: formatNumber(newDownPayment) })
  }
  const handleDownPaymentSliderChange = (value: number) => {
    const newDownPayment = Math.min(Math.max(value, mortgageModel.minDownPayment), params.purchasePrice)
    setParams({ ...params, downPayment: newDownPayment })
    setInputValues({ ...inputValues, downPayment: formatNumber(newDownPayment) })
  }

  // Interest rate handlers
  const handleInterestRateChange = (value: string) => {
    setInputValues({ ...inputValues, interestRate: value })
  }
  const handleInterestRateBlur = () => {
    const parsedValue = parseNumber(inputValues.interestRate)
    const validValue = Math.min(Math.max(parsedValue, MortgageModel.MIN_INTEREST_RATE), MortgageModel.MAX_INTEREST_RATE)
    setParams({ ...params, interestRate: validValue })
    setInputValues({ ...inputValues, interestRate: validValue.toFixed(2) })
  }

  // Amortization handlers
  const handleAmortizationChange = (value: string) => {
    setInputValues({ ...inputValues, amortizationYears: value })
  }
  const handleAmortizationBlur = () => {
    const parsedValue = parseNumber(inputValues.amortizationYears)
    const validValue = Math.min(
      Math.max(parsedValue, MortgageModel.MIN_AMORTIZATION_YEARS),
      MortgageModel.MAX_AMORTIZATION_YEARS,
    )
    setParams({ ...params, amortizationYears: validValue })
    setInputValues({ ...inputValues, amortizationYears: validValue.toString() })
  }

  return (
    <Card>
      <CardContent className="my-4">
        <form onSubmit={handleSubmit} className="space-y-6 justify-between">
          <div>
            <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
            <Input
              id="purchasePrice"
              value={inputValues.purchasePrice}
              onChange={(e) => handlePurchasePriceChange(e.target.value)}
              onBlur={handlePurchasePriceBlur}
              required
            />
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <Label>Down Payment</Label>
              <div className="flex gap-4 items-center">
                <Input
                  value={inputValues.downPayment}
                  onChange={(e) => handleDownPaymentChange(e.target.value)}
                  onBlur={handleDownPaymentBlur}
                  className="w-[200px]"
                />
                <div className="text-sm text-muted-foreground">
                  {currentDownPaymentPercent.toFixed(1)}%
                  <span className="ml-2 text-xs">
                    (Min: ${formatNumber(mortgageModel.minDownPayment)} / {minDownPaymentPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <Slider
                value={[params.downPayment || mortgageModel.minDownPayment]}
                onValueChange={([value]) => handleDownPaymentSliderChange(value)}
                min={mortgageModel.minDownPayment}
                max={params.purchasePrice}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${formatNumber(mortgageModel.minDownPayment)}</span>
                <span>${(params.purchasePrice * 0.2).toLocaleString()} (20%)</span>
                <span>${formatNumber(params.purchasePrice)}</span>
              </div>
            </div>

            <ValueWithExplanation
              label="Mortgage Insurance"
              value={insurancePremium}
              type="currency"
              explanation={
                insurancePremium > 0
                  ? 'CMHC insurance is required for down payments less than 20%. This protects the lender if you default.'
                  : 'No mortgage insurance required with 20% or more down payment.'
              }
            >
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    currentDownPaymentPercent >= 20 ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentDownPaymentPercent / 20) * 100)}%` }}
                />
              </div>
            </ValueWithExplanation>
          </div>

          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              value={inputValues.interestRate}
              onChange={(e) => handleInterestRateChange(e.target.value)}
              onBlur={handleInterestRateBlur}
              required
            />
          </div>

          <div>
            <Label htmlFor="amortizationYears">Amortization (Years)</Label>
            <Input
              id="amortizationYears"
              value={inputValues.amortizationYears}
              onChange={(e) => handleAmortizationChange(e.target.value)}
              onBlur={handleAmortizationBlur}
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
              onValueChange={(value: string) => setParams({ ...params, province: value as Province })}
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

          <div>
            <ClosingCostsDialog closingCosts={mortgage.closingCosts} onUpdate={handleClosingCostsUpdate} />
          </div>

          <Button type="submit" className="w-full">
            Calculate
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
