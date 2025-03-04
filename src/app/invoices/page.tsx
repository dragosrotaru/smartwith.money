import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getActiveAccount } from '@/modules/account/activeAccount'
import { getInvoicesByAccountId } from '@/modules/invoices/actions'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'
import { withReadAccess } from '@/modules/account/actions'

export const metadata: Metadata = {
  title: 'Invoices',
  description: 'View and manage your invoices',
}

export default async function InvoicesPage() {
  const accountId = await getActiveAccount()
  if (!accountId) redirect('/')

  const auth = await withReadAccess(accountId)
  if (auth instanceof Error) notFound()

  const result = await getInvoicesByAccountId(accountId)
  if (result instanceof Error) notFound()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                    {invoice.number}
                  </Link>
                </TableCell>
                <TableCell>{invoice.date.toLocaleDateString()}</TableCell>
                <TableCell>{invoice.fromCompany.name}</TableCell>
                <TableCell>{invoice.toCompany.name}</TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
              </TableRow>
            ))}
            {result.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No invoices found. Create your first invoice to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
