import { getById } from '@/modules/real-estate/housesigma/repo'
import PropertyDetailContainer from './Container'

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await getById(id)

  // todo handle error
  if (property instanceof Error) return <div>Error Retrieving Property, Please try again later</div>

  return <PropertyDetailContainer property={property} />
}
