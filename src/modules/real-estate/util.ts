export const MONTHS_IN_YEAR = 12
export const BIWEEKLY_IN_YEAR = 26
export const SEMI_MONTHLY_IN_YEAR = 24
export const WEEKLY_IN_YEAR = 52

export function futureValue(principal: number, rate: number, time: number) {
  return principal * Math.pow(1 + rate, time)
}

export function formatNum(value: number): number {
  return Number(value.toFixed(2))
}

export function calculateCumulative(paymentNumber: number, fn: (paymentNumber: number) => number) {
  let cumulative = 0
  for (let i = 1; i < paymentNumber; i++) {
    cumulative += fn(i)
  }
  return cumulative
}

export function calculateBracket(income: number, brackets: { threshold: number; rate: number }[]): number {
  let tax = 0
  let previousThreshold = 0

  for (const { threshold, rate } of brackets) {
    if (income > previousThreshold) {
      const taxableAmount = Math.min(income, threshold) - previousThreshold
      tax += taxableAmount * rate
      previousThreshold = threshold
    } else {
      break
    }
  }

  return tax
}

export class Value {
  constructor(
    public value: number,
    public rate: number,
  ) {}
  futureValue(time: number) {
    return futureValue(this.value, this.rate, time)
  }
  prettyPrint() {
    console.log('--------------------------------')
    console.log(this.constructor.name)
    console.log('--------------------------------')
    console.log('Value', formatNum(this.value))
    console.log('Increase Rate', this.rate)
  }
  futureValueAtMonth(month: number) {
    return this.futureValue(month / MONTHS_IN_YEAR)
  }
  futureValueAtYear(year: number) {
    return this.futureValue(year)
  }
  futureValueAtMonthPerMonth(month: number) {
    return this.futureValue(month / MONTHS_IN_YEAR) / MONTHS_IN_YEAR
  }
}
