import { HouseSigmaRepo } from '@/modules/house/housesigma/repo'
import PropertyDetailContainer from './Container'

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const repo = new HouseSigmaRepo()
  const property = await repo.getById(id)
  if (!property) return <div>Loading...</div>
  return <PropertyDetailContainer property={property} />
}
