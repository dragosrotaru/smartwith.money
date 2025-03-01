import { LAWYER_FEE, INSPECTOR_FEE, APPRAISER_FEE, TITLE_INSURANCE_FEE } from './constants'

export interface ClosingCostsProps {
  legalFees: number
  titleInsurance: number
  appraisalFee: number
  homeInspection: number
  propertyTaxAdjustment: number
  utilityAdjustments: number
}

export class ClosingCosts {
  public legalFees: number
  public titleInsurance: number
  public appraisalFee: number
  public homeInspection: number
  public propertyTaxAdjustment: number
  public utilityAdjustments: number

  constructor(props: Partial<ClosingCostsProps> = {}) {
    this.legalFees = props.legalFees ?? LAWYER_FEE
    this.titleInsurance = props.titleInsurance ?? TITLE_INSURANCE_FEE
    this.appraisalFee = props.appraisalFee ?? APPRAISER_FEE
    this.homeInspection = props.homeInspection ?? INSPECTOR_FEE
    this.propertyTaxAdjustment = props.propertyTaxAdjustment ?? 0
    this.utilityAdjustments = props.utilityAdjustments ?? 0
  }

  get total(): number {
    return (
      this.legalFees +
      this.titleInsurance +
      this.appraisalFee +
      this.homeInspection +
      this.propertyTaxAdjustment +
      this.utilityAdjustments
    )
  }
}
