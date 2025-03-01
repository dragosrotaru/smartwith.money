'use client'
import { Mortgage as MortgageModel, MortgageProps } from '@/modules/real-estate/domain/mortgage'
import { MortgageDisplay } from './MortgageDisplay'
import MortgageForm from './MortgageForm'
import { useState } from 'react'
import { MortgageRatesCard } from '@/modules/real-estate/components/MortgageRatesCard'

export default function MortgageCalculator({ initialMortgageProps }: { initialMortgageProps: MortgageProps }) {
  const [mortgage, setMortgage] = useState<MortgageModel>(() => new MortgageModel(initialMortgageProps))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
      <div className="space-y-4">
        <MortgageForm mortgage={mortgage} setMortgage={setMortgage} />
        <MortgageRatesCard />
      </div>
      <div>
        <MortgageDisplay mortgage={mortgage} />
      </div>
    </div>
  )
}
