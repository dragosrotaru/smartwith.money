import PropertyExplorer from './_components/PropertyExplorer'
import { getAllByActiveAccount } from '@/modules/real-estate/housesigma/repo'
import { menu } from '@/lib/menu'
import { redirect } from 'next/navigation'

export default async function PropertiesPage() {
  const properties = await getAllByActiveAccount()
  if (properties instanceof Error) redirect(menu.signin.href)

  return (
    <main className="min-h-screen bg-background">
      <PropertyExplorer properties={properties} />
    </main>
  )
}
