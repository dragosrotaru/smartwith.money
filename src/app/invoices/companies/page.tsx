import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCompaniesForActiveAccount } from '@/modules/invoices/actions'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { withReadWriteAccess } from '@/modules/account/actions'

export const metadata: Metadata = {
  title: 'Companies',
  description: 'View and manage your companies',
}

export default async function CompaniesPage() {
  const result = await getCompaniesForActiveAccount()
  if (result instanceof Error) redirect('/')

  const writeAuth = await withReadWriteAccess()
  const writeAccess = !(writeAuth instanceof Error)

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-muted-foreground">View and manage your companies</p>
        </div>
        {writeAccess && (
          <Button asChild>
            <Link href="/invoices/companies/new">
              <Plus className="h-4 w-4 mr-2" />
              New Company
            </Link>
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <Link href={`/invoices/companies/${company.id}`} className="hover:underline">
                    {company.name}
                  </Link>
                </TableCell>
                <TableCell>{company.contactName}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>
                  {company.city}, {company.state}, {company.country}
                </TableCell>
              </TableRow>
            ))}
            {result.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No companies found. Create your first company to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
