import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { withReadWriteAccess } from '@/modules/account/actions'
import { CompanyForm } from '../../_components/CompanyForm'

export const metadata: Metadata = {
  title: 'New Company',
  description: 'Create a new company',
}

export default async function NewCompanyPage() {
  const auth = await withReadWriteAccess()
  if (auth instanceof Error) redirect('/')

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">New Company</h1>
        <p className="text-muted-foreground">Create a new company</p>
      </div>

      <CompanyForm />
    </div>
  )
}
