import {
  MONTHS_IN_YEAR,
  BIWEEKLY_IN_YEAR,
  SEMI_MONTHLY_IN_YEAR,
  WEEKLY_IN_YEAR,
  calculateBracket,
  calculateCumulative,
  formatNum,
} from '../util'
import { STANDARD_PURCHASE_DEPOSIT } from './constants'
import { ClosingCosts, ClosingCostsProps } from './closingCosts'
import { Province } from '@/modules/location/provinces'

export const PAYMENT_FREQUENCIES = ['monthly', 'bi-weekly', 'semi-monthly', 'weekly']
export type PaymentFrequency = (typeof PAYMENT_FREQUENCIES)[number]

export type MortgageProps = {
  purchasePrice: number
  downPayment?: number
  interestRate: number
  amortizationYears: number
  paymentFrequency: PaymentFrequency
  isFirstTimeBuyer: boolean
  isNewConstruction: boolean
  province: Province
  closingCosts?: ClosingCostsProps
}

export class Mortgage {
  static MIN_AMORTIZATION_YEARS = 1
  static MAX_AMORTIZATION_YEARS = 30
  static MIN_INTEREST_RATE = 0
  static MAX_INTEREST_RATE = 10
  static MIN_PURCHASE_PRICE = 10000
  public purchasePrice: number
  public downPayment: number
  public interestRate: number
  public amortizationYears: number
  public paymentFrequency: PaymentFrequency
  public isFirstTimeBuyer: boolean
  public isNewConstruction: boolean
  public province: Province
  public closingCosts: ClosingCosts

  constructor(props: MortgageProps) {
    this.purchasePrice = props.purchasePrice
    this.interestRate = props.interestRate
    this.amortizationYears = props.amortizationYears
    this.paymentFrequency = props.paymentFrequency
    this.isFirstTimeBuyer = props.isFirstTimeBuyer
    this.isNewConstruction = props.isNewConstruction
    this.province = props.province
    this.downPayment = props.downPayment || this.minDownPayment
    this.closingCosts = new ClosingCosts(props.closingCosts)
    if (this.interestRate <= 0) throw new Error('Interest rate cannot be 0')
    if (this.purchasePrice <= 0) throw new Error('Principal cannot be 0')
    if (this.downPayment < 0) throw new Error('Down payment cannot be negative')
    if (this.downPayment > this.purchasePrice) throw new Error('Down payment cannot be greater than purchase price')
    if (this.downPayment < this.minDownPayment) throw new Error('Down payment cannot be less than min down payment')
    if (this.amortizationYears <= 0) throw new Error('Amortization years cannot be 0')
    if (this.amortizationYears > 30) throw new Error('Amortization years cannot be greater than 30')
    if (this.isNewConstruction) throw new Error('New construction not supported (Sales Tax support is missing)')
  }

  get insurancePremiumRate(): number {
    const baseRates: { threshold: number; rate: number }[] = [
      { threshold: 0.65, rate: 0.006 }, // 65%
      { threshold: 0.75, rate: 0.017 }, // 75%
      { threshold: 0.8, rate: 0.024 }, // 80%
      { threshold: 0.85, rate: 0.028 }, // 85%
      { threshold: 0.9, rate: 0.031 }, // 90%
      { threshold: 0.95, rate: 0.04 }, // 95%
    ]

    // Find the applicable rate based on loan-to-value ratio
    let rate =
      baseRates.find(({ threshold }) => this.loanToValue <= threshold)?.rate ?? baseRates[baseRates.length - 1].rate

    // Add 0.2% (20 basis points) for first-time buyers or new construction with 30-year amortization
    if ((this.isFirstTimeBuyer || this.isNewConstruction) && this.amortizationYears === 30) rate += 0.002 // 0.2%

    return rate
  }

  get mortgageInsurance(): { premium: number; pst: number } {
    if (this.downPayment >= this.purchasePrice * 0.2) {
      return { premium: 0, pst: 0 }
    }
    const rate = this.insurancePremiumRate
    const premium = this.loanPrincipal * rate

    const pstRates: Record<string, number> = {
      MB: 0, // Manitoba
      QC: 0.09, // Quebec
      ON: 0.08, // Ontario
      SK: 0.06, // Saskatchewan
      AB: 0, // Alberta
      BC: 0, // British Columbia
      PE: 0, // Prince Edward Island
      YT: 0, // Yukon
      NT: 0, // Northwest Territories
      NU: 0, // Nunavut
      NS: 0, // Nova Scotia
      NB: 0, // New Brunswick
      NL: 0, // Newfoundland and Labrador
    }
    const pst = pstRates[this.province] ? premium * pstRates[this.province] : 0

    return { premium, pst }
  }

  get landTransferTax() {
    let tax = calculateBracket(this.purchasePrice, [
      { threshold: 55000, rate: 0.005 },
      { threshold: 250000, rate: 0.01 },
      { threshold: 400000, rate: 0.015 },
      { threshold: 2000000, rate: 0.02 },
      { threshold: Infinity, rate: 0.025 },
    ])
    if (this.isFirstTimeBuyer) {
      tax = tax - Math.max(0, tax - 4000)
    }
    return tax
  }

  get totalFees() {
    return this.mortgageInsurance.pst + this.landTransferTax + this.closingCosts.total
  }

  get minDownPayment() {
    return calculateBracket(this.purchasePrice, [
      { threshold: 500000, rate: 0.05 },
      { threshold: 1500000, rate: 0.1 },
      { threshold: Infinity, rate: 0.2 },
    ])
  }

  get purchaseDeposit() {
    return this.purchasePrice * STANDARD_PURCHASE_DEPOSIT
  }

  get minDownPaymentPercentage() {
    return this.minDownPayment / this.purchasePrice
  }

  get loanPrincipal() {
    return this.purchasePrice - this.downPayment
  }

  get loanToValue() {
    return this.loanPrincipal / this.purchasePrice
  }

  get cashNeededUpFront() {
    return this.downPayment + this.totalFees
  }

  get finalPrincipal() {
    return this.loanPrincipal + this.mortgageInsurance.premium
  }

  get numberOfPaymentsPerYear() {
    if (this.paymentFrequency === 'monthly') {
      return MONTHS_IN_YEAR
    } else if (this.paymentFrequency === 'bi-weekly') {
      return BIWEEKLY_IN_YEAR
    } else if (this.paymentFrequency === 'semi-monthly') {
      return SEMI_MONTHLY_IN_YEAR
    } else if (this.paymentFrequency === 'weekly') {
      return WEEKLY_IN_YEAR
    }
    throw new Error('Invalid payment frequency')
  }

  get numberOfPayments() {
    return this.amortizationYears * this.numberOfPaymentsPerYear
  }

  get numberOfMonths() {
    return this.amortizationYears * MONTHS_IN_YEAR
  }

  get numberOfPaymentsPerMonth() {
    if (this.paymentFrequency === 'monthly') {
      return 1
    } else if (this.paymentFrequency === 'bi-weekly') {
      return BIWEEKLY_IN_YEAR / MONTHS_IN_YEAR
    } else if (this.paymentFrequency === 'semi-monthly') {
      return SEMI_MONTHLY_IN_YEAR / MONTHS_IN_YEAR
    } else if (this.paymentFrequency === 'weekly') {
      return WEEKLY_IN_YEAR / MONTHS_IN_YEAR
    }
    throw new Error('Invalid payment frequency')
  }

  get paymentInterestRate() {
    // Convert to semi-annual rate first (Canadian standard)
    const semiAnnualRate = this.interestRate / 200

    if (this.paymentFrequency === 'monthly') {
      // For monthly payments: Convert semi-annual to monthly using (1 + r)^(2/12) - 1
      return Math.pow(1 + semiAnnualRate, 2 / 12) - 1
    } else if (this.paymentFrequency === 'bi-weekly') {
      // For bi-weekly payments: Convert semi-annual to bi-weekly using (1 + r)^(2/26) - 1
      // 26 bi-weekly periods in a year
      return Math.pow(1 + semiAnnualRate, 2 / 26) - 1
    } else if (this.paymentFrequency === 'semi-monthly') {
      // For semi-monthly payments: Convert semi-annual to semi-monthly using (1 + r)^(2/24) - 1
      // 24 semi-monthly periods in a year
      return Math.pow(1 + semiAnnualRate, 2 / 24) - 1
    } else if (this.paymentFrequency === 'weekly') {
      // For weekly payments: Convert semi-annual to weekly using (1 + r)^(2/52) - 1
      // 52 weekly periods in a year
      return Math.pow(1 + semiAnnualRate, 2 / 52) - 1
    } else {
      throw new Error('Invalid payment frequency')
    }
  }

  get insurancePayment() {
    return this.mortgageInsurance.premium / this.numberOfPayments
  }

  get monthlyPayment() {
    return this.payment * this.numberOfPaymentsPerMonth
  }

  get totalInterest() {
    return this.payment * this.numberOfPayments - this.finalPrincipal
  }

  get payment() {
    // Calculate the monthly payment first
    const monthlyPayment =
      this.finalPrincipal *
      ((this.monthlyInterestRate * Math.pow(1 + this.monthlyInterestRate, this.numberOfMonths)) /
        (Math.pow(1 + this.monthlyInterestRate, this.numberOfMonths) - 1))

    // For non-monthly frequencies, use the accelerated payment calculation
    if (this.paymentFrequency === 'monthly') {
      return monthlyPayment
    } else if (this.paymentFrequency === 'semi-monthly') {
      return monthlyPayment / 2
    } else if (this.paymentFrequency === 'bi-weekly') {
      return monthlyPayment / (BIWEEKLY_IN_YEAR / MONTHS_IN_YEAR)
    } else if (this.paymentFrequency === 'weekly') {
      return monthlyPayment / (WEEKLY_IN_YEAR / MONTHS_IN_YEAR)
    }
    throw new Error('Invalid payment frequency')
  }

  // Add helper for monthly interest rate calculation
  private get monthlyInterestRate() {
    const semiAnnualRate = this.interestRate / 200
    return Math.pow(1 + semiAnnualRate, 2 / 12) - 1
  }

  getMonthToPaymentNumber(month: number) {
    return month * this.numberOfPaymentsPerMonth
  }

  interestAtPayment(paymentNumber: number) {
    let remainingPrincipal = this.finalPrincipal

    for (let i = 1; i < paymentNumber; i++) {
      const interest = remainingPrincipal * this.paymentInterestRate
      const principalPaid = this.payment - interest
      remainingPrincipal -= principalPaid
    }

    return remainingPrincipal * this.paymentInterestRate
  }

  principalAtPayment(paymentNumber: number) {
    return this.payment - this.interestAtPayment(paymentNumber) - this.insurancePayment
  }

  cumulativeEquityAtPayment(paymentNumber: number) {
    return (
      this.downPayment + calculateCumulative(paymentNumber, (paymentNumber) => this.principalAtPayment(paymentNumber))
    )
  }

  // includes mortgage insurance balance
  leftoverPrincipalAtPayment(paymentNumber: number) {
    return (
      this.finalPrincipal -
      calculateCumulative(paymentNumber, (paymentNumber) => this.principalAtPayment(paymentNumber)) -
      this.insurancePayment
    )
  }

  prettyPrint() {
    // print all values
    console.log('--------------------------------')
    console.log('Mortgage')
    console.log('--------------------------------')
    console.log('Loan Principal', formatNum(this.loanPrincipal))
    console.log('Mortgage Insurance', this.mortgageInsurance)
    console.log('Principal + Insurance', formatNum(this.finalPrincipal))
    console.log('Min Down Payment ($)', formatNum(this.minDownPayment))
    console.log('Min Down Payment (%)', this.minDownPaymentPercentage)
    console.log('Cash Needed Up Front', formatNum(this.cashNeededUpFront))
    console.log('Purchase Deposit', formatNum(this.purchaseDeposit))
    console.log('Total Fees', formatNum(this.totalFees))
    console.log('Total Interest Paid', formatNum(this.totalInterest))

    console.log('Interest Rate', formatNum(this.interestRate))
    console.log('Payment Frequency', this.paymentFrequency)
    console.log('Payments Per Month', this.numberOfPaymentsPerMonth)
    console.log('Payment', formatNum(this.payment))
    console.log('Monthly Payment', formatNum(this.monthlyPayment))
    console.log('Ammortization Years', formatNum(this.amortizationYears))
    console.log('Number of Payments', this.numberOfPayments)
    console.log('Number of Months', this.numberOfMonths)

    console.log('Is First Time Buyer', this.isFirstTimeBuyer)
    console.log('Is New Construction', this.isNewConstruction)
    console.log('Province', this.province)
    console.log('Loan to Value', formatNum(this.loanToValue))
    console.log('Insurance Premium Rate', formatNum(this.insurancePremiumRate))
    console.log('Payment Interest Rate', this.paymentInterestRate)
    // console.log('Total Equity', formatNum(this.calculateCumulativeEquity(this.numberOfMonths + 1)))
    // console.log('Leftover Principal', formatNum(this.calculateLeftoverPrincipal(this.numberOfMonths + 1)))
  }
}
