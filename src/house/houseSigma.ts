import { FILES, readFile, writeFile } from './repo'

type ListingEvent = 'For Sale' | 'Terminated' | 'Sold' | 'Expired'
type PropertyInfo = {
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

function getBasicInfo(res: any): PropertyInfo {
  const { house, listing_history, key_facts_v2, analytics, community_stats, property_detail } = res.data.data
  const listingHistory = listing_history.map((listing: any) => ({
    startDate: new Date(listing.date_start),
    endDate: listing.date_end ? new Date(listing.date_end) : null,
    askingPrice: Number(listing.price.replace('$', '')),
    listingId: listing.id_listing,
    event: listing.status as ListingEvent,
  }))
  return {
    address: {
      street: house.address,
      municipality: house.municipality_name,
      postalCode: house.postal_code,
      province: house.province,
      country: house.country,
    },
    zoning: property_detail.land.value.find((v: any) => v.name === 'Zoning')?.value || null,
    coordinates: {
      latitude: house.map.lat,
      longitude: house.map.lon,
    },
    propertyTax: house.tax_int,
    lotSize: house.land.depth * house.land.front,
    squareFootage: house.house_area.estimate,
    askingPrice: house.price_int,
    daysOnMarket: house.list_dates.date_list_days,
    aggregatedDaysOnMarket: Number(key_facts_v2.aggregated_dom.value),
    listingHistory: listingHistory,
    estimatePrice: analytics.estimate_price_int,
    estimatePriceConfident: analytics.estimate_price_confident,
    estimateRent: analytics.estimate_rent_int,
    estimateRentDays: analytics.estimate_rent_days,
    estimateRentYearReturn: analytics.estimate_rent_yearreturn,
    scores: analytics.scores,
    communityValue: {
      value: community_stats.price_sold_median,
      growth: community_stats.growth_year / 100,
      growth5YearAverage: community_stats.price_sold_growth_5y / 100,
      growth10YearAverage: community_stats.price_sold_growth_10y / 100,
    },
  }
}

export function analyzeHouseSigma(data: any) {
  const detail = data['https://housesigma.com/bkv2/api/listing/info/detail_v2']
  // const soldPriceStats = data['https://housesigma.com/bkv2/api/community/soldpricestats']
  // const popularity = data['https://housesigma.com/bkv2/api/listing/info/popularity']
  //const nearbySold = data['https://housesigma.com/bkv2/api/listing/nearby/sold']

  const photos: string[] = detail.data.data.picture.photo_list

  const basicInfo = getBasicInfo(detail)

  return {
    photos,
    basicInfo,
  }
}

export function loadOrGenHouseSigma(
  propertyId: string,
  hasBasicFile: boolean,
  hsFile: any,
): ReturnType<typeof analyzeHouseSigma> {
  if (!hasBasicFile) {
    const houseSigma = analyzeHouseSigma(hsFile)
    writeFile(propertyId, FILES.basic, houseSigma)
    return houseSigma
  } else {
    return readFile(propertyId, FILES.basic)
  }
}
