import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getInvoiceById } from '@/modules/invoices/actions'
import { InvoiceView } from '../_components/InvoiceView'

interface InvoicePageProps {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: 'Invoice Details',
  description: 'View and download invoice details',
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params
  const invoice = await getInvoiceById(id)

  if (!invoice) notFound()
  return <InvoiceView data={invoice} />
}
