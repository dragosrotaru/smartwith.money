import { MONTHS_IN_YEAR, BIMONTHS_IN_YEAR, calculateBracket, calculateCumulative, formatNum } from '../util'
import { APPRAISER_FEE, INSPECTOR_FEE, LAWYER_FEE, STANDARD_PURCHASE_DEPOSIT, TITLE_INSURANCE_FEE } from './constants'

export type PaymentFrequency = 'monthly' | 'bi-weekly'
export type Province = 'ON' | 'MB' | 'QC' | 'SK' | 'Other'
export type MortgageProps = {
  purchasePrice: number
  downPayment?: number
  interestRate: number
  amortizationYears: number
  paymentFrequency: PaymentFrequency
  isFirstTimeBuyer: boolean
  isNewConstruction: boolean
  province: Province
}

export class Mortgage {
  public purchasePrice: number
  public downPayment: number
  public interestRate: number
  public amortizationYears: number
  public paymentFrequency: PaymentFrequency
  public isFirstTimeBuyer: boolean
  public isNewConstruction: boolean
  public province: Province
  constructor(props: MortgageProps) {
    this.purchasePrice = props.purchasePrice
    this.interestRate = props.interestRate
    this.amortizationYears = props.amortizationYears
    this.paymentFrequency = props.paymentFrequency
    this.isFirstTimeBuyer = props.isFirstTimeBuyer
    this.isNewConstruction = props.isNewConstruction
    this.province = props.province
    this.downPayment = props.downPayment || this.minDownPayment
    if (this.interestRate <= 0) throw new Error('Interest rate cannot be 0')
    if (this.purchasePrice <= 0) throw new Error('Principal cannot be 0')
    if (this.downPayment < 0) throw new Error('Down payment cannot be negative')
    if (this.downPayment > this.purchasePrice) throw new Error('Down payment cannot be greater than purchase price')
    if (this.downPayment < this.minDownPayment) throw new Error('Down payment cannot be less than min down payment')
    if (this.amortizationYears <= 0) throw new Error('Amortization years cannot be 0')
    if (this.amortizationYears > 30) throw new Error('Amortization years cannot be greater than 30')
    if (this.province !== 'ON') throw new Error('Province not supported')
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

    const pstRates: Record<string, number> = { MB: 0.07, QC: 0.099, ON: 0.08, SK: 0.06 }
    const pst = pstRates[this.province] ? premium * pstRates[this.province] : 0

    return { premium, pst }
  }

  get landTransferTax() {
    let tax = calculateBracket(this.purchasePrice, [
      { threshold: 55000, rate: 0.005 },
      { threshold: 250000, rate: 0.01 },
      { threshold: 400000, rate: 0.015 },
      { threshold: 2000000, rate: 0.02 },
      { threshold: 2000000, rate: 0.025 },
    ])
    if (this.isFirstTimeBuyer) {
      tax = tax - Math.max(0, tax - 4000)
    }
    return tax
  }

  get totalFees() {
    return (
      this.mortgageInsurance.pst +
      this.landTransferTax +
      LAWYER_FEE +
      INSPECTOR_FEE +
      APPRAISER_FEE +
      TITLE_INSURANCE_FEE
    )
  }

  get minDownPayment() {
    return calculateBracket(this.purchasePrice, [
      { threshold: 500000, rate: 0.05 },
      { threshold: 1500000, rate: 0.1 },
      { threshold: 2000000, rate: 0.2 },
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
    return this.paymentFrequency === 'monthly' ? MONTHS_IN_YEAR : BIMONTHS_IN_YEAR
  }

  get numberOfPayments() {
    return this.amortizationYears * this.numberOfPaymentsPerYear
  }

  get numberOfMonths() {
    return this.amortizationYears * MONTHS_IN_YEAR
  }

  get paymentsPerMonth() {
    return this.paymentFrequency === 'monthly' ? 1 : 2
  }

  get paymentInterestRate() {
    return this.interestRate / 100 / this.numberOfPaymentsPerYear
  }

  get insurancePayment() {
    return this.mortgageInsurance.premium / this.numberOfPayments
  }

  get monthlyPayment() {
    return this.payment / this.paymentsPerMonth
  }

  get totalInterest() {
    return this.payment * this.numberOfPayments - this.finalPrincipal
  }

  get payment() {
    return (
      (this.finalPrincipal *
        (this.paymentInterestRate * Math.pow(1 + this.paymentInterestRate, this.numberOfPayments))) /
      (Math.pow(1 + this.paymentInterestRate, this.numberOfPayments) - 1)
    )
  }

  getMonthToPaymentNumber(month: number) {
    return month * this.paymentsPerMonth
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
    console.log('Payments Per Month', this.paymentsPerMonth)
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
