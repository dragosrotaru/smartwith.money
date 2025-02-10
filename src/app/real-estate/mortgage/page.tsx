'use client'
import { Mortgage } from '@/modules/house/domain/mortgage'
import MortgageCalculator from '../_components/mortgage/MortgageCalculator'
import { useState } from 'react'

export default function MortgagePage() {
  const initialProps = {
    purchasePrice: 8000000,
    interestRate: 4.2,
    amortizationYears: 30,
    paymentFrequency: 'monthly',
    isFirstTimeBuyer: false, // todo load from Account if available
    isNewConstruction: false,
    province: 'ON', // todo load from Account if available
  }
  const [mortgage, setMortgage] = useState<Mortgage>(new Mortgage(initialProps))
  return (
    <div>
      <h1 className="text-2xl font-bold text-center my-8">Mortgage Calculator</h1>
      <MortgageCalculator mortgage={mortgage} setMortgage={setMortgage} initialParams={initialProps} />
    </div>
  )
}
