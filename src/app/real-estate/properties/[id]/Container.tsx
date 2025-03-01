'use client'
import { Mortgage as MortgageModel, MortgageProps } from '@/modules/real-estate/domain/mortgage'
import { House as HouseModel } from '@/modules/real-estate/domain/house'
import { useState } from 'react'
import MortgageCalculator from '../../_components/mortgage/MortgageCalculator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HouseSigma } from '@/modules/real-estate/housesigma/schema'
import { ChevronLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { RenovationRecommendations } from '../../_components/renovations/Renovations'
import { HouseDisplay } from '../../_components/house/HouseDisplay'
import { Value } from '@/modules/real-estate/util'
import {
  ANNUAL_PROPERTY_TAX_INCREASE_RATE,
  ANNUAL_UPKEEP_PERCENTAGE,
  IS_FIRST_TIME_BUYER,
  IS_NEW_CONSTRUCTION,
  PROVINCE,
  VACANCY_RATE,
} from '@/modules/real-estate/domain/constants'
import ImageCarousel from '../_components/ImageCarousel'
import { menu } from '@/lib/menu'

export default function PropertyDetailContainer(props: { property: HouseSigma }) {
  const { property } = props

  const INFLATION_RATE = 0.02

  const initialMortgageParams: MortgageProps = {
    purchasePrice: property.basicInfo.askingPrice,
    downPayment: undefined, // todo parameterize
    interestRate: 4.2, // todo parameterize
    amortizationYears: 25, // todo parameterize
    paymentFrequency: 'monthly', // todo parameterize
    province: PROVINCE,
    isFirstTimeBuyer: IS_FIRST_TIME_BUYER,
    isNewConstruction: IS_NEW_CONSTRUCTION,
  }

  // todo bubble up to parent
  const [mortgage, setMortgage] = useState<MortgageModel>(new MortgageModel(initialMortgageParams))

  const [house] = useState<HouseModel>(
    new HouseModel({
      mortgage,
      annualPropertyTax: new Value(property.basicInfo.propertyTax, ANNUAL_PROPERTY_TAX_INCREASE_RATE),
      annualRent: new Value(property.basicInfo.estimateRent, INFLATION_RATE),
      annualRentVacancyRate: VACANCY_RATE,
      annualAppreciationRate: property.basicInfo.communityValue.growth10YearAverage / 10,
      squareFootage: property.basicInfo.squareFootage,
      rentedSquareFootage: 0, // todo parameterize
      rennovationCost: 0, // todo grab from RenovationRecommendations
      rennovationROI: 0, // todo grab from RenovationRecommendations
      annualUpkeepPercentage: ANNUAL_UPKEEP_PERCENTAGE,
      inflationRate: INFLATION_RATE,
    }),
  )
  if (!property) return <div>Loading...</div>

  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-8">{property.basicInfo.address.street}</h1>
        <div className="flex flex-row gap-2">
          <Link href={menu.properties.href}>
            <Button variant="outline">
              <ChevronLeftIcon />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <ImageCarousel photos={property.photos} />
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="font-semibold">Address</dt>
                  <dd>
                    {property.basicInfo.address.street}, {property.basicInfo.address.municipality},{' '}
                    {property.basicInfo.address.province}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Asking Price</dt>
                  <dd>${property.basicInfo.askingPrice.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Square Footage</dt>
                  <dd>{property.basicInfo.squareFootage} sq ft</dd>
                </div>
                <div>
                  <dt className="font-semibold">Lot Size</dt>
                  <dd>{property.basicInfo.lotSize} sq ft</dd>
                </div>
                <div>
                  <dt className="font-semibold">Property Tax</dt>
                  <dd>${property.basicInfo.propertyTax.toLocaleString()}/year</dd>
                </div>
                <div>
                  <dt className="font-semibold">Days on Market</dt>
                  <dd>{property.basicInfo.daysOnMarket}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Community Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="font-semibold">Community Value</dt>
                  <dd>${property.basicInfo.communityValue.value.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Growth (1 Year)</dt>
                  <dd>{(property.basicInfo.communityValue.growth * 100).toFixed(2)}%</dd>
                </div>
                <div>
                  <dt className="font-semibold">Growth (5 Year Avg)</dt>
                  <dd>{(property.basicInfo.communityValue.growth5YearAverage * 100).toFixed(2)}%</dd>
                </div>
                <div>
                  <dt className="font-semibold">Growth (10 Year Avg)</dt>
                  <dd>{(property.basicInfo.communityValue.growth10YearAverage * 100).toFixed(2)}%</dd>
                </div>
                <div>
                  <dt className="font-semibold">School Score</dt>
                  <dd>{property.basicInfo.scores.school}/10</dd>
                </div>
                <div>
                  <dt className="font-semibold">Rent Score</dt>
                  <dd>{property.basicInfo.scores.rent}/10</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div>
          <MortgageCalculator initialMortgageProps={mortgage} />
          <HouseDisplay house={house} />
        </div>
      </div>
      <div className="mt-8">
        <RenovationRecommendations property={property} />
      </div>
    </div>
  )
}
