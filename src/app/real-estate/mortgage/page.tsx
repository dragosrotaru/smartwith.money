import { getActiveAccount } from '@/modules/account/activeAccount'
import { getAccountPreferences } from '@/modules/account/actions'
import MortgageCalculator from '../_components/mortgage/MortgageCalculator'
import { MortgageProps } from '@/modules/real-estate/domain/mortgage'
import { Province } from '@/modules/location/provinces'

export default async function MortgagePage() {
  const accountId = await getActiveAccount()
  let isFirstTimeBuyer = false
  let province: Province = 'ON'

  if (accountId) {
    const preferences = await getAccountPreferences(accountId)
    if (!(preferences instanceof Error)) {
      isFirstTimeBuyer = preferences.isFirstTimeHomeBuyer
      province = preferences.province
    }
  }

  const initialMortgageProps: MortgageProps = {
    purchasePrice: 800_000,
    interestRate: 4.2,
    amortizationYears: 30,
    paymentFrequency: 'monthly',
    isFirstTimeBuyer,
    isNewConstruction: false,
    province,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Mortgage Calculator</h1>
      <MortgageCalculator initialMortgageProps={initialMortgageProps} />
    </div>
  )
}
