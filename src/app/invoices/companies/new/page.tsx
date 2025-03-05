import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getActiveAccount } from '@/modules/account/activeAccount'
import { CompanyForm } from '../../_components/CompanyForm'

export const metadata: Metadata = {
  title: 'New Company',
  description: 'Create a new company',
}

export default async function NewCompanyPage() {
  const account = await getActiveAccount()
  if (!account) redirect('/accounts')

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">New Company</h1>
        <p className="text-muted-foreground">Create a new company</p>
      </div>

      <CompanyForm accountId={account} />
    </div>
  )
}
