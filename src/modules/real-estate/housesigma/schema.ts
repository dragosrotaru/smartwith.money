export type ListingEvent = 'For Sale' | 'Terminated' | 'Sold' | 'Expired'
export type PropertyInfo = {
  id: string
  address: {
    street: string
    municipality: string
    postalCode: string
    province: string
    country: string
  }
  zoning: string | null
  propertyTax: number
  lotSize: number
  squareFootage: number
  askingPrice: number
  daysOnMarket: number
  aggregatedDaysOnMarket: number
  listingHistory: {
    startDate: Date
    endDate: Date | null
    askingPrice: number
    listingId: string
    event: ListingEvent
  }[]
  estimatePrice: number
  estimatePriceConfident: number
  estimateRent: number
  estimateRentDays: number
  estimateRentYearReturn: number
  scores: {
    school: number
    growth: number
    rent: number
  }
  communityValue: {
    value: number
    growth: number
    growth5YearAverage: number
    growth10YearAverage: number
  }
  coordinates: {
    latitude: number
    longitude: number
  }
}

export type HouseSigma = {
  photos: string[]
  basicInfo: PropertyInfo
}
