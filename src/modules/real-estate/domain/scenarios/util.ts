import { MONTHS_IN_YEAR, Value } from '../../util'
import { ANNUAL_RENT_INCREASE, IS_FIRST_TIME_BUYER, IS_NEW_CONSTRUCTION, PROVINCE } from '../constants'
import { House } from '../house'
import { Mortgage, PaymentFrequency } from '../mortgage'

export type ScenarioProps = {
  economic: {
    annualIndexFundReturn: number
    inflationRate: number
    monthlyRentPlusUtilities: number
  }
  house: {
    purchasePrice: number
    annualPropertyTax: number
    annualAppreciationRate: number
    annualPropertyTaxIncreaseRate: number
    squareFootage: number
    annualUpkeepPercentage: number
  }
  rental: {
    rentedSquareFootage: number
    monthlyIncome: number
    vacancyRate: number
  }
  rennovation: {
    cost: number
    roi: number
  }
  mortgage: {
    downPayment?: number
    interestRate: number
    amortizationYears: number
    paymentFrequency: PaymentFrequency
  }
}

export function constructHouse(props: ScenarioProps, print = false) {
  const { economic, house, rental, rennovation, mortgage } = props
  const mg = new Mortgage({
    purchasePrice: house.purchasePrice,
    downPayment: mortgage.downPayment,
    interestRate: mortgage.interestRate,
    amortizationYears: mortgage.amortizationYears,
    paymentFrequency: mortgage.paymentFrequency,
    province: PROVINCE,
    isFirstTimeBuyer: IS_FIRST_TIME_BUYER,
    isNewConstruction: IS_NEW_CONSTRUCTION,
  })

  const hs = new House({
    mortgage: mg,
    annualPropertyTax: new Value(house.annualPropertyTax, house.annualPropertyTaxIncreaseRate),
    annualRent: new Value(rental.monthlyIncome * MONTHS_IN_YEAR, ANNUAL_RENT_INCREASE),
    annualRentVacancyRate: rental.vacancyRate,
    annualAppreciationRate: house.annualAppreciationRate,
    squareFootage: house.squareFootage,
    rentedSquareFootage: rental.rentedSquareFootage,
    rennovationCost: rennovation.cost,
    rennovationROI: rennovation.roi,
    annualUpkeepPercentage: house.annualUpkeepPercentage,
    inflationRate: economic.inflationRate,
  })

  if (print) {
    mg.prettyPrint()
    hs.prettyPrint()
  }

  return {
    mortgage: mg,
    house: hs,
  }
}
