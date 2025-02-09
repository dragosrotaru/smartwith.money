import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { PropertyInfo } from '@/modules/house/housesigma/schema'
import Link from 'next/link'
import CardImageCarousel from './CardImageCarousel'
import { formatNum } from '@/modules/house/util'

interface PropertyCardProps {
  property: PropertyInfo
  photos: string[]
  onRemove: (propertyId: string) => void
}

export function PropertyCard({ property, photos }: PropertyCardProps) {
  const listingDate = property.listingHistory
    .filter((l) => l.event === 'For Sale' && l.endDate === null)[0]
    ?.startDate.toLocaleDateString()
  return (
    <Link href={`/real-estate/properties/${property.id}`}>
      <Card className="w-full max-w-sm mx-auto md:mx-0">
        <CardImageCarousel photos={photos} />
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{property.address.street}</h2>
          <p className="text-gray-600 mb-2">
            {property.address.municipality}, {property.address.province}
          </p>
          <p className="text-lg font-semibold mb-2">${property.askingPrice.toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>Per Sq Ft: ${formatNum(property.askingPrice / property.squareFootage)}</p>
            <p>Growth: {formatNum((property.communityValue.growth10YearAverage * 100) / 10)}%</p>
            <p>Sq Ft: {property.squareFootage}</p>
            <p>Lot Size: {property.lotSize} sqft</p>
            <p>Bedrooms: N/A</p>
            <p>Bathrooms: N/A</p>
            <p>Zoning: {property.zoning}</p>

            <p>Listed: {listingDate ? listingDate : 'N/A'}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </Link>
  )
}
