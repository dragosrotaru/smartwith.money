import { getActiveAccount, setActiveAccount } from '@/lib/activeAccount'
import PropertyExplorer from './_components/PropertyExplorer'
import { getAllByAccountId } from '@/modules/house/housesigma/repo'
import { authorization, withReadAccess } from '@/modules/account/actions'
import { menu } from '@/lib/menu'
import { redirect } from 'next/navigation'

export default async function PropertiesPage() {
  let activeAccount = await getActiveAccount()

  if (!activeAccount) {
    const auth = await authorization()
    if (auth instanceof Error) redirect(menu.login.href)
    if (auth.accounts.length === 0) redirect(menu.onboarding.href)
    activeAccount = auth.accounts[0].id
    setActiveAccount(activeAccount)
  }

  const auth = await withReadAccess(activeAccount)
  if (auth instanceof Error) redirect(menu.login.href)

  const properties = await getAllByAccountId(activeAccount)
  return (
    <main className="min-h-screen bg-gray-100">
      <PropertyExplorer properties={properties} />
    </main>
  )
}
