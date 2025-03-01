'use server'

import { Province } from '../location/provinces'

export interface MortgageProvider {
  id: number
  slug: string
  name: string
  logo: string
  contactPhone: string
  websiteUrl: string
  reviews: number | null
  rating: number | null
  short_description: string
  description: string
  brokerage: string | null
  lenderType: 'bank' | 'broker' | 'credit union' | 'Other'
  bigBank: boolean
  renewalBonus: {
    value: number
    text: string | null
  }
}

export interface MortgageRate {
  id: number
  value: number
  cashBack: number | null
  lumpSum: number
  premiumBps: number | null
  rateHold: number
  regularPayment: number
  maxAmortization: number
  downPaymentBucket: string
  insuranceBucket: string
  isCashBack: boolean
  isOpen: boolean
  isPreApproval: boolean
  isRental: boolean
  province: Province | null
  scenario: string
  term: number
  type: 'fixed' | 'variable'
  href: string
  description: string
  provider: string
  isFeatured: boolean
  isBpsApplied: boolean
}

export interface MortgageRatesResponse {
  data: {
    primeRate: number
    qualifyingRate: number
    lastUpdated: string
    providers: Record<string, MortgageProvider>
    rates: {
      fixed: Record<string, MortgageRate[]>
      variable: Record<string, MortgageRate[]>
    }
  }
}

export interface GetMortgageRatesParams {
  amortization: number
  city: string
  downPaymentPercent: number
  homePrice: number
  isCashBack: 0 | 1
  isFeatured: 0 | 1
  isOpen: 0 | 1
  isOwnerOccupied: 0 | 1
  isPreApproval: 0 | 1
  language: string
  province: Province
  scenario: 'purchase' | 'refinance' | 'switch'
  term: number[]
  type: Array<'fixed' | 'variable'>
}

export async function getMortgageRates(
  params: Partial<GetMortgageRatesParams>,
): Promise<MortgageRatesResponse | Error> {
  try {
    const defaultParams: GetMortgageRatesParams = {
      amortization: 25,
      city: 'Toronto',
      downPaymentPercent: 0.05,
      homePrice: 400000,
      isCashBack: 0,
      isFeatured: 1,
      isOpen: 0,
      isOwnerOccupied: 1,
      isPreApproval: 0,
      language: 'en',
      province: 'ON',
      scenario: 'purchase',
      term: [12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 300],
      type: ['fixed', 'variable'],
    }

    const queryParams = new URLSearchParams()
    const mergedParams = { ...defaultParams, ...params }

    // Add all parameters to query string
    Object.entries(mergedParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(`${key}[]`, v.toString()))
      } else if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    console.log(queryParams.toString())

    const response = await fetch(
      `https://api.ratehub.ca/mortgage-rates/best/purchase-rates?${queryParams.toString()}`,
      {
        next: { revalidate: 60 * 60 },
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
      }, // Cache for 1 hour
    )

    console.log(response)

    if (!response.ok) {
      throw new Error('Failed to fetch mortgage rates')
    }

    const data: MortgageRatesResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching mortgage rates:', error)
    return new Error('Failed to fetch mortgage rates')
  }
}
