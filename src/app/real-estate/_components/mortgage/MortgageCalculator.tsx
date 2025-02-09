import { Mortgage as MortgageModel, MortgageProps } from '@/modules/house/domain/mortgage'
import { MortgageDisplay } from './MortgageDisplay'
import MortgageForm from './MortgageForm'

export default function MortgageCalculator({
  mortgage,
  setMortgage,
  initialParams,
}: {
  mortgage: MortgageModel
  setMortgage: (mortgage: MortgageModel) => void
  initialParams: MortgageProps
}) {
  return (
    <div className="flex flex-row gap-4 justify-center">
      <MortgageForm setMortgage={setMortgage} initialParams={initialParams} />
      <MortgageDisplay mortgage={mortgage} />
    </div>
  )
}
