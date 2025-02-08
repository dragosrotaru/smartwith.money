import { Mortgage } from './mortgage'
import { formatNum, futureValue, MONTHS_IN_YEAR, Value } from '../util'
import { ANNUAL_INSURANCE, REALTOR_PERCENTAGE, RENTAL_TAX_RATE } from './constants'

export type HouseProps = {
  mortgage: Mortgage
  annualPropertyTax: Value
  annualRent: Value
  annualAppreciationRate: number
  annualRentVacancyRate: number
  squareFootage: number
  rentedSquareFootage: number
  rennovationCost: number
  rennovationROI: number
  inflationRate: number
  annualUpkeepPercentage: number
}

export class House {
  public mortgage: Mortgage
  public annualPropertyTax: Value
  public annualUpkeep: Value
  public annualInsurance: Value
  public annualRent: Value
  public annualUtilities: Value
  public annualAppreciationRate: number
  public annualRentVacancyRate: number
  public squareFootage: number
  public rentedSquareFootage: number
  public rennovationCost: number
  public rennovationROI: number

  constructor(props: HouseProps) {
    this.mortgage = props.mortgage
    this.annualPropertyTax = props.annualPropertyTax
    this.annualAppreciationRate = props.annualAppreciationRate
    this.annualRent = props.annualRent
    this.annualRentVacancyRate = props.annualRentVacancyRate
    this.annualUpkeep = new Value(props.annualUpkeepPercentage * this.mortgage.purchasePrice, props.inflationRate)
    this.annualInsurance = new Value(ANNUAL_INSURANCE, props.inflationRate)
    this.squareFootage = props.squareFootage
    this.rentedSquareFootage = props.rentedSquareFootage
    this.rennovationCost = props.rennovationCost
    this.rennovationROI = props.rennovationROI
    this.annualUtilities = new Value(this.estimateUtilityCosts(this.squareFootage), props.inflationRate)
  }

  estimateUtilityCosts(squareFootage: number) {
    const internet = 40
    const electricity = 138
    const water = 50
    const gas = 215
    return internet + electricity + water + gas * (squareFootage / 2182) // using my house as a reference
  }

  get rentedPercentage() {
    return this.rentedSquareFootage / this.squareFootage
  }

  utilitiesPerMonthAtMonth(month: number) {
    return this.annualUtilities.futureValueAtMonthPerMonth(month)
  }

  propertyTaxPerMonthAtMonth(month: number) {
    return this.annualPropertyTax.futureValueAtMonthPerMonth(month)
  }

  upkeepPerMonthAtMonth(month: number) {
    return this.annualUpkeep.futureValueAtMonthPerMonth(month)
  }

  insurancePerMonthAtMonth(month: number) {
    return this.annualInsurance.futureValueAtMonthPerMonth(month)
  }

  writeOffPerMonthAtMonth(month: number) {
    return this.annualCostsPerMonthAtMonth(month) * this.rentedPercentage
  }

  annualCostsPerMonthAtMonth(month: number) {
    return (
      this.propertyTaxPerMonthAtMonth(month) +
      this.upkeepPerMonthAtMonth(month) +
      this.insurancePerMonthAtMonth(month) +
      this.utilitiesPerMonthAtMonth(month)
    )
  }

  valueAtMonth(month: number) {
    return futureValue(
      this.mortgage.purchasePrice + this.rennovationCost * (1 + this.rennovationROI),
      this.annualAppreciationRate,
      month / MONTHS_IN_YEAR,
    )
  }

  closingCostsAtMonth(month: number) {
    return this.valueAtMonth(month) * REALTOR_PERCENTAGE
  }

  equityAtMonth(month: number) {
    return (
      this.valueAtMonth(month) -
      this.closingCostsAtMonth(month) -
      this.mortgage.leftoverPrincipalAtPayment(this.mortgage.getMonthToPaymentNumber(month))
    )
  }

  rentIncomeAtYear(year: number) {
    return this.annualRent.futureValue(year) * (1 - this.annualRentVacancyRate)
  }

  rentIncomePerMonthAtMonth(month: number) {
    const rentIncome = this.rentIncomeAtYear(Math.floor(month / MONTHS_IN_YEAR)) / MONTHS_IN_YEAR

    const writeOff = this.writeOffPerMonthAtMonth(month)
    const taxableProfit = rentIncome - writeOff
    const tax = taxableProfit * RENTAL_TAX_RATE
    return rentIncome - tax
  }

  cashFlowPerMonthAtMonth(month: number) {
    return this.rentIncomePerMonthAtMonth(month) - this.annualCostsPerMonthAtMonth(month) - this.mortgage.monthlyPayment
  }

  prettyPrint() {
    console.log('--------------------------------')
    console.log('House')
    console.log('--------------------------------')
    console.log('Value at Month 0', formatNum(this.valueAtMonth(0)))
    console.log('Equity at Month 0', formatNum(this.equityAtMonth(0)))
    console.log('Annual Property Tax', formatNum(this.annualPropertyTax.value))
    console.log('Annual Appreciation Rate', this.annualAppreciationRate)
    console.log('Annual Rent Income', formatNum(this.annualRent.value))
    console.log('Annual Rent Increase Rate', this.annualRent.rate)
    console.log('Annual Rent Vacancy Rate', this.annualRentVacancyRate)
    console.log('Upkeep at Month 0', formatNum(this.upkeepPerMonthAtMonth(0)))
    console.log('Insurance at Month 0', formatNum(this.insurancePerMonthAtMonth(0)))
    console.log('Costs at Month 0', formatNum(this.annualCostsPerMonthAtMonth(0)))
    console.log('Closing Costs at Month 0', formatNum(this.closingCostsAtMonth(0)))
    console.log('Rent at Year 0', formatNum(this.rentIncomeAtYear(0)))
    console.log('Rent at Month 1', formatNum(this.rentIncomePerMonthAtMonth(1)))
    console.log('Cash Flow at Month 1', formatNum(this.cashFlowPerMonthAtMonth(1)))
    console.log('--------------------------------')
  }
}
