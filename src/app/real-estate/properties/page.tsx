import PropertyExplorer from './_components/PropertyExplorer'
import { HouseSigmaRepo } from '@/modules/house/housesigma/repo'

export default async function PropertiesPage() {
  const repo = new HouseSigmaRepo()
  const properties = await repo.getAll()
  console.log(properties)
  return (
    <main className="min-h-screen bg-gray-100">
      <PropertyExplorer properties={properties} />
    </main>
  )
}
