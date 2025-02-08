import { futureValue, MONTHS_IN_YEAR } from '../util'
import { CAPITAL_GAINS_TAX_PORTION, CAPITAL_GAINS_TAX_RATE } from './constants'

export class Investment {
  constructor(
    public startMonth: number,
    public principal: number,
    public annualReturn: number,
  ) {}

  valueAtMonth(month: number) {
    return futureValue(this.principal, this.annualReturn, (month - this.startMonth) / MONTHS_IN_YEAR)
  }

  capitalGainsTax(initialAmount: number, finalAmount: number) {
    const capitalGains = finalAmount - initialAmount
    const taxable = capitalGains * CAPITAL_GAINS_TAX_PORTION
    return taxable * CAPITAL_GAINS_TAX_RATE
  }
}
