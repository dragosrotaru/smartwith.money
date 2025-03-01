import { Province } from '@/modules/location/provinces'

// these are pretty standard and I dont want to change them, just validate their accuracy
export const STANDARD_PURCHASE_DEPOSIT = 0.05
export const LAWYER_FEE = 1500
export const INSPECTOR_FEE = 500
export const APPRAISER_FEE = 500
export const TITLE_INSURANCE_FEE = 300
export const REALTOR_PERCENTAGE = 0.04
export const ANNUAL_INSURANCE = 1_411 // average found online

export const IS_FIRST_TIME_BUYER = true
export const IS_NEW_CONSTRUCTION = false
export const PROVINCE: Province = 'ON'

// these are variable but hard to estimate
export const CAPITAL_GAINS_TAX_PORTION = 0.5
export const CAPITAL_GAINS_TAX_RATE = 0.25 // assuming we can optimize when we sell investments
export const RENTAL_TAX_RATE = 0.3 // assuming we all into this tax bracket
export const ANNUAL_RENT_INCREASE = 0.025 // 2.5% increase per year allowed by Ontario

export const COMBINATIONS = 1
export const RENOVATION_HOURS = 2000
export const ANNUAL_UPKEEP_PERCENTAGE = 0.01
export const ANNUAL_PROPERTY_TAX_INCREASE_RATE = 0.01 // todo need to validate this
export const VACANCY_RATE = 0.04 // for grimsby
export const MONTHLY_RENT_PLUS_UTILITIES = 2250 // for me

export const MONTHS = 60

const paymentFrequencies = ['monthly'] as const
const amortizationYears = [30]
const interestRates = [3.8]
const purchasePriceMultipliers = [1.0]
const annualIndexFundReturns = [0.12]
const inflationRates = [0.02]
const rentedRatios = [0]
const rennovationInvestments = [0]

export function generateCombinations(samples: number) {
  const combinations = []

  for (const purchasePriceMultiplier of purchasePriceMultipliers) {
    for (const rennovationInvestment of rennovationInvestments) {
      for (const ratioRented of rentedRatios) {
        for (const interestRate of interestRates) {
          for (const inflationRate of inflationRates) {
            for (const annualIndexFundReturn of annualIndexFundReturns) {
              for (const amortizationYear of amortizationYears) {
                for (const paymentFrequency of paymentFrequencies) {
                  combinations.push({
                    purchasePriceMultiplier,
                    rennovationInvestment,
                    ratioRented,
                    interestRate,
                    inflationRate,
                    annualIndexFundReturn,
                    amortizationYear,
                    paymentFrequency,
                  })
                }
              }
            }
          }
        }
      }
    }
  }

  return combinations.sort(() => Math.random() - 0.5).slice(0, samples)
}
