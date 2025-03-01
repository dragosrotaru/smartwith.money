import { formatNum } from '../../util'
import { House } from '../house'
import { Investment } from '../investment'
import { CAPITAL_GAINS_TAX_RATE } from '../constants'
import { constructHouse, ScenarioProps } from './util'

export type BuyVsBuyResult = {
  month: number
  cashFlowA: number
  cashFlowB: number
  cashFlowDifference: number
  investmentA: number
  investmentB: number
  investmentDifference: number
  equityA: number
  equityB: number
  equityDifference: number
  netWorthA: number
  netWorthB: number
  netWorthDifference: number
}

export class BuyVsBuy {
  results: BuyVsBuyResult[] = []
  constructor(
    public houseA: House,
    public houseB: House,
    public economic: {
      annualIndexFundReturn: number
      inflationRate: number
    },
  ) {}

  calculate(maxMonth: number) {
    const accumulatedValues: {
      month: number
      cashFlowA: number
      cashFlowB: number
      equityA: number
      equityB: number
      investmentA: Investment[]
      investmentB: Investment[]
    }[] = []
    const upFrontOpportunityCostInvestmentA = new Investment(
      0,
      this.houseA.mortgage.cashNeededUpFront,
      this.economic.annualIndexFundReturn,
    )
    const rennovationOpportunityCostInvestmentA = new Investment(
      0,
      this.houseA.rennovationCost,
      this.economic.annualIndexFundReturn,
    )
    const upFrontOpportunityCostInvestmentB = new Investment(
      0,
      this.houseB.mortgage.cashNeededUpFront,
      this.economic.annualIndexFundReturn,
    )
    const rennovationOpportunityCostInvestmentB = new Investment(
      0,
      this.houseB.rennovationCost,
      this.economic.annualIndexFundReturn,
    )

    const houseAInvestments: Investment[] = []
    const houseBInvestments: Investment[] = []

    for (let month = 0; month < maxMonth; month++) {
      const cashFlowA = this.houseA.cashFlowPerMonthAtMonth(month)
      const cashFlowB = this.houseB.cashFlowPerMonthAtMonth(month)
      const equityA = this.houseA.equityAtMonth(month)
      const equityB = this.houseB.equityAtMonth(month)

      if (cashFlowA > 0 && cashFlowB > 0) {
        if (cashFlowA > cashFlowB) {
          houseAInvestments.push(new Investment(month, cashFlowA - cashFlowB, this.economic.annualIndexFundReturn))
        } else {
          houseBInvestments.push(new Investment(month, cashFlowB - cashFlowA, this.economic.annualIndexFundReturn))
        }
      } else if (cashFlowA > 0) {
        houseAInvestments.push(
          new Investment(month, cashFlowA + Math.abs(cashFlowB), this.economic.annualIndexFundReturn),
        )
      } else if (cashFlowB > 0) {
        houseBInvestments.push(
          new Investment(month, cashFlowB + Math.abs(cashFlowA), this.economic.annualIndexFundReturn),
        )
      } else {
        if (Math.abs(cashFlowA) > Math.abs(cashFlowB)) {
          houseBInvestments.push(
            new Investment(month, Math.abs(cashFlowA) - Math.abs(cashFlowB), this.economic.annualIndexFundReturn),
          )
        } else {
          houseAInvestments.push(
            new Investment(month, Math.abs(cashFlowB) - Math.abs(cashFlowA), this.economic.annualIndexFundReturn),
          )
        }
      }

      accumulatedValues.push({
        month,
        cashFlowA,
        cashFlowB,
        equityA,
        equityB,
        investmentA: [...houseAInvestments],
        investmentB: [...houseBInvestments],
      })
    }

    const output: BuyVsBuyResult[] = []

    accumulatedValues.forEach((value) => {
      const upFrontOpCostA = upFrontOpportunityCostInvestmentA.valueAtMonth(value.month)
      const upFrontOpCostB = upFrontOpportunityCostInvestmentB.valueAtMonth(value.month)
      const rennovationOpCostA = rennovationOpportunityCostInvestmentA.valueAtMonth(value.month / 2) // assume rennovations are done half way through
      const rennovationOpCostB = rennovationOpportunityCostInvestmentB.valueAtMonth(value.month / 2) // assume rennovations are done half way through

      let houseAInvestment = value.investmentA.reduce(
        (acc, investment) => acc + investment.valueAtMonth(value.month),
        0,
      )

      let houseBInvestment = value.investmentB.reduce(
        (acc, investment) => acc + investment.valueAtMonth(value.month),
        0,
      )

      if (upFrontOpCostA > upFrontOpCostB) {
        houseBInvestment += upFrontOpCostA - upFrontOpCostB
      } else {
        houseAInvestment += upFrontOpCostB - upFrontOpCostA
      }

      if (rennovationOpCostA > rennovationOpCostB) {
        houseBInvestment += rennovationOpCostA - rennovationOpCostB
      } else {
        houseAInvestment += rennovationOpCostB - rennovationOpCostA
      }

      const investmentDifference = (houseAInvestment - houseBInvestment) * (1 - CAPITAL_GAINS_TAX_RATE)

      const netWorthA = value.equityA + houseAInvestment
      const netWorthB = value.equityB + houseBInvestment

      const netWorthDifference = netWorthA - netWorthB

      output.push({
        month: value.month,
        cashFlowA: formatNum(value.cashFlowA),
        cashFlowB: formatNum(value.cashFlowB),
        equityA: formatNum(value.equityA),
        equityB: formatNum(value.equityB),
        cashFlowDifference: formatNum(Math.abs(value.cashFlowA) - Math.abs(value.cashFlowB)),
        equityDifference: formatNum(value.equityA - value.equityB),
        investmentA: formatNum(houseAInvestment),
        investmentB: formatNum(houseBInvestment),
        investmentDifference: formatNum(investmentDifference),
        netWorthA: formatNum(netWorthA),
        netWorthB: formatNum(netWorthB),
        netWorthDifference: formatNum(netWorthDifference),
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

export function buyVsBuy(propsA: ScenarioProps, propsB: ScenarioProps, maxMonth: number, print = false) {
  const { economic } = propsA
  const { house: houseA } = constructHouse(propsA, print)
  const { house: houseB } = constructHouse(propsB, print)

  const scenario = new BuyVsBuy(houseA, houseB, economic)

  scenario.calculate(maxMonth)
  if (print) scenario.prettyPrint()

  return {
    results: scenario.results,
    params: { propsA, propsB },
  }
}
