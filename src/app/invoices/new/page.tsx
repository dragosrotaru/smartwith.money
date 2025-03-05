import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCompaniesForInvoice } from '@/modules/invoices/actions'
import { InvoiceForm } from '../_components/InvoiceForm'
import { getActiveAccount } from '@/modules/account/activeAccount'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'New Invoice',
  description: 'Create a new invoice',
}

export default async function NewInvoicePage() {
  const account = await getActiveAccount()
  if (!account) redirect('/accounts')

  const companies = await getCompaniesForInvoice(account)
  if (!companies.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-semibold">No Companies Found</h1>
        <p className="text-muted-foreground">
          You need to create at least one company before you can create an invoice.
        </p>
        <Link href="/invoices/companies/new" className="text-primary hover:underline">
          Create your first company
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">New Invoice</h1>
        <p className="text-muted-foreground">Create a new invoice</p>
      </div>

      <InvoiceForm accountId={account} companies={companies} />
    </div>
  )
}
