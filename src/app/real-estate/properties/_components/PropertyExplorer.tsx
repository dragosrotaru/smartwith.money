'use client'
import { useState } from 'react'
import { PropertyCard } from './PropertyCard'
import { HouseSigma } from '@/modules/house/housesigma/schema'

export default function PropertyExplorer(props: { properties: HouseSigma[] }) {
  const [properties, setProperties] = useState<HouseSigma[]>(props.properties)

  const removeProperty = (propertyId: string) => {
    setProperties(properties.filter((property) => property.basicInfo.id !== propertyId))
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Saved Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property, index) => (
          <PropertyCard key={index} property={property.basicInfo} photos={property.photos} onRemove={removeProperty} />
        ))}
      </div>
    </div>
  )
}
