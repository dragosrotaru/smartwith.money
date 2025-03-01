import { formatNum, MONTHS_IN_YEAR, Value } from '../../util'
import { House } from '../house'
import { Investment } from '../investment'
import {
  ANNUAL_PROPERTY_TAX_INCREASE_RATE,
  ANNUAL_RENT_INCREASE,
  ANNUAL_UPKEEP_PERCENTAGE,
  CAPITAL_GAINS_TAX_RATE,
  MONTHLY_RENT_PLUS_UTILITIES,
  MONTHS,
  VACANCY_RATE,
} from '../constants'
import { constructHouse, ScenarioProps } from './util'
import { fromHouseSigma } from '../../housesigma'

export type RentVsBuyResult = {
  month: number
  cashFlow: number
  equity: number
  rentOpCost: number
  baselineOpCost: number
  rentDifference: number
  baselineDifference: number
}

class RentVsBuy {
  results: RentVsBuyResult[] = []
  constructor(
    public house: House,
    public rent: Value,
    public economic: {
      annualIndexFundReturn: number
      inflationRate: number
    },
  ) {}

  calculate(maxMonth: number) {
    const accumulatedValues: {
      month: number
      cashFlow: number
      equity: number
      rentInvestments: Investment[]
      positiveCashflowInvestments: Investment[]
      negativeCashflowInvestments: Investment[]
      baselineInvestments: Investment[]
    }[] = []
    const upFrontOpportunityCostInvestment = new Investment(
      0,
      this.house.mortgage.cashNeededUpFront,
      this.economic.annualIndexFundReturn,
    )
    const rennovationOpportunityCostInvestment = new Investment(
      0,
      this.house.rennovationCost,
      this.economic.annualIndexFundReturn,
    )

    // positive cashflow investments
    const positiveCashflowInvestments: Investment[] = []

    // negative cashflow investments
    const negativeCashflowInvestments: Investment[] = []

    // rent investments
    const rentInvestments: Investment[] = []

    // baseline investments
    const baselineInvestments: Investment[] = []

    for (let month = 0; month < maxMonth; month++) {
      const cashFlow = this.house.cashFlowPerMonthAtMonth(month)
      const equity = this.house.equityAtMonth(month)

      if (cashFlow > 0) {
        // if we have positive cash flow and invest it
        positiveCashflowInvestments.push(new Investment(month, cashFlow, this.economic.annualIndexFundReturn))
      } else {
        const absCashFlow = Math.abs(cashFlow)

        // the baseline investment opportunity cost
        baselineInvestments.push(new Investment(month, absCashFlow, this.economic.annualIndexFundReturn))

        const diff = this.rent.futureValueAtMonthPerMonth(month) - absCashFlow
        const investment = new Investment(month, diff, this.economic.annualIndexFundReturn)

        // if rent is higher than cash flow (we are saving money by buying)
        if (this.rent.futureValueAtMonthPerMonth(month) > absCashFlow) {
          negativeCashflowInvestments.push(investment)
        } else {
          // if rent is lower than cash flow (we are losing money by buying)
          rentInvestments.push(investment)
        }
      }

      accumulatedValues.push({
        month,
        cashFlow,
        equity,
        rentInvestments: [...rentInvestments],
        positiveCashflowInvestments: [...positiveCashflowInvestments],
        negativeCashflowInvestments: [...negativeCashflowInvestments],
        baselineInvestments: [...baselineInvestments],
      })
    }

    const output: RentVsBuyResult[] = []

    accumulatedValues.forEach((value) => {
      const upFrontOpCost = upFrontOpportunityCostInvestment.valueAtMonth(value.month)
      const rennovationOpCost = rennovationOpportunityCostInvestment.valueAtMonth(value.month / 2) // assume rennovations are done half way through

      const positiveCashflowInvestment = value.positiveCashflowInvestments.reduce(
        (acc, investment) => acc + investment.valueAtMonth(value.month),
        0,
      )

      // negative cashflow investments in relation to rent
      const negativeCashflowInvestment = value.negativeCashflowInvestments.reduce(
        (acc, investment) => acc + investment.valueAtMonth(value.month),
        0,
      )

      const baselineInvestmentOpCost = value.baselineInvestments.reduce(
        (acc, investment) => acc + investment.valueAtMonth(value.month),
        0,
      )
      const rentInvestmentOpCost = value.rentInvestments.reduce(
        (acc, investment) => acc + investment.valueAtMonth(value.month),
        0,
      )

      // the opportunity cost of buying vs renting
      const rentOpCost = (upFrontOpCost + rennovationOpCost + rentInvestmentOpCost) * (1 - CAPITAL_GAINS_TAX_RATE)

      // the opportunity cost of buying vs doing nothing (living in a tent)
      const baselineOpCost =
        (upFrontOpCost + rennovationOpCost + baselineInvestmentOpCost) * (1 - CAPITAL_GAINS_TAX_RATE)

      const houseUpsideRent = (positiveCashflowInvestment + negativeCashflowInvestment) * (1 - CAPITAL_GAINS_TAX_RATE)

      const houseUpsideBaseline = positiveCashflowInvestment * (1 - CAPITAL_GAINS_TAX_RATE)

      const rentDifference = houseUpsideRent + value.equity - rentOpCost
      const baselineDifference = houseUpsideBaseline + value.equity - baselineOpCost

      output.push({
        month: value.month,
        cashFlow: formatNum(value.cashFlow), // the monthly cash flow
        equity: formatNum(value.equity), // the equity retained in the house after selling costs
        rentOpCost: formatNum(rentOpCost), // the opportunity cost of buying vs renting
        baselineOpCost: formatNum(baselineOpCost), // the opportunity cost of buying vs doing nothing (living in a tent)
        rentDifference: formatNum(rentDifference), // the difference between renting and buying
        baselineDifference: formatNum(baselineDifference),
      })
    })

    this.results = output
  }

  prettyPrint() {
    console.log('--------------------------------')
    console.log('Scenario')
    console.log('--------------------------------')
    for (const result of this.results) {
      console.log(`${result.month} months:`, result)
    }
    console.log('--------------------------------')
  }
}

export function rentVsBuy(props: ScenarioProps, maxMonth: number, print = false) {
  const { economic } = props
  const currentRent = new Value(economic.monthlyRentPlusUtilities * MONTHS_IN_YEAR, ANNUAL_RENT_INCREASE)
  const { house } = constructHouse(props)

  const scenario = new RentVsBuy(house, currentRent, economic)
  scenario.calculate(maxMonth)

  if (print) scenario.prettyPrint()

  return {
    results: scenario.results,
    params: props,
  }
}

// Generate Scenario Analysis
export function constructRentVsBuy(
  params: {
    purchasePriceMultiplier: number
    ratioRented: number
    interestRate: number
    inflationRate: number
    annualIndexFundReturn: number
    amortizationYear: number
    paymentFrequency: 'monthly'
    rennovations: {
      cost: number
      roi: number
    }
  },
  houseSigma: ReturnType<typeof fromHouseSigma>,
) {
  const ECONOMIC = {
    annualIndexFundReturn: params.annualIndexFundReturn,
    inflationRate: params.inflationRate,
    monthlyRentPlusUtilities: MONTHLY_RENT_PLUS_UTILITIES,
  }

  return rentVsBuy(
    {
      mortgage: {
        interestRate: params.interestRate,
        amortizationYears: params.amortizationYear,
        paymentFrequency: params.paymentFrequency,
      },
      house: {
        purchasePrice: houseSigma.basicInfo.askingPrice * params.purchasePriceMultiplier,
        annualPropertyTax: houseSigma.basicInfo.propertyTax,
        squareFootage: houseSigma.basicInfo.squareFootage,
        annualAppreciationRate: houseSigma.basicInfo.communityValue.growth10YearAverage / 10,
        annualPropertyTaxIncreaseRate: ANNUAL_PROPERTY_TAX_INCREASE_RATE,
        annualUpkeepPercentage: ANNUAL_UPKEEP_PERCENTAGE,
      },
      rental: {
        monthlyIncome: houseSigma.basicInfo.estimateRent * params.ratioRented,
        rentedSquareFootage: houseSigma.basicInfo.squareFootage * params.ratioRented,
        vacancyRate: VACANCY_RATE,
      },
      economic: ECONOMIC,
      rennovation: params.rennovations,
    },
    60,
    true,
  )
}

export function initializeStats() {
  type Stat = { [key: number]: RentVsBuyResult }
  type Param = {
    [key: number]: {
      month: number
      cashFlow: ScenarioProps | number
      equity: ScenarioProps | number
      rentOpCost: ScenarioProps | number
      baselineOpCost: ScenarioProps | number
      rentDifference: ScenarioProps | number
      baselineDifference: ScenarioProps | number
    }
  }
  // Setup stats
  const avg: Stat = {}
  const min: Stat = {}
  const max: Stat = {}
  const maxParams: Param = {}
  const minParams: Param = {}

  function init(month: number, value: number): RentVsBuyResult {
    return {
      month,
      cashFlow: value,
      equity: value,
      rentOpCost: value,
      baselineOpCost: value,
      rentDifference: value,
      baselineDifference: value,
    }
  }

  // Initialize Stats
  for (let month = 0; month < MONTHS; month++) {
    avg[month] = init(month, 0)
    min[month] = init(month, Infinity)
    max[month] = init(month, -Infinity)

    minParams[month] = init(month, 0)
    maxParams[month] = init(month, 0)
  }

  return { avg, min, max, maxParams, minParams }
}
