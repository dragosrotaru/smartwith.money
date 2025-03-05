import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
// import Image from 'next/image'

export interface InvoiceItem {
  description: string
  amount: number
  tax: number
  taxType: string
  total: number
}

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  from: {
    companyName: string
    address: string[]
    businessNumber: string
    taxNumber: string
    contactName: string
    email: string
  }
  to: {
    companyName: string
    address: string[]
    contactName: string
    email: string
  }
  items: InvoiceItem[]
  terms: string
  totalTax: number
  totalDue: number
  currency?: string
}

interface InvoiceProps {
  data: InvoiceData
  className?: string
}

export function Invoice({ data, className }: InvoiceProps) {
  return (
    <Card className={cn('p-8 print:p-6 print:shadow-none', className)}>
      <div className="flex justify-between items-start">
        <div className="flex-shrink-0">
          {/* <Image src="/logo.png" alt="Company Logo" width={64} height={64} className="h-16 w-auto" /> */}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Invoice Date: <span className="font-semibold text-foreground">{data.invoiceDate.toLocaleDateString()}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Invoice No: <span className="font-semibold text-foreground">{data.invoiceNumber}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">From</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{data.from.companyName}</p>
            {data.from.address.map((line, i) => (
              <p key={i} className="text-muted-foreground">
                {line}
              </p>
            ))}
            <p className="text-muted-foreground">Business #: {data.from.businessNumber}</p>
            <p className="text-muted-foreground">Tax #: {data.from.taxNumber}</p>
            <p className="text-muted-foreground">{data.from.contactName}</p>
            <p className="text-muted-foreground">{data.from.email}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Billed To</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{data.to.companyName}</p>
            {data.to.address.map((line, i) => (
              <p key={i} className="text-muted-foreground">
                {line}
              </p>
            ))}
            <p className="text-muted-foreground">{data.to.contactName}</p>
            <p className="text-muted-foreground">{data.to.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left text-sm font-medium text-muted-foreground">Description</th>
              <th className="py-2 text-right text-sm font-medium text-muted-foreground">Amount</th>
              <th className="py-2 text-right text-sm font-medium text-muted-foreground">Tax</th>
              <th className="py-2 text-right text-sm font-medium text-muted-foreground">Tax Type</th>
              <th className="py-2 text-right text-sm font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="py-4 text-sm">{item.description}</td>
                <td className="py-4 text-sm text-right">{formatCurrency(item.amount, data.currency)}</td>
                <td className="py-4 text-sm text-right">{formatCurrency(item.tax, data.currency)}</td>
                <td className="py-4 text-sm text-right">{item.taxType}</td>
                <td className="py-4 text-sm text-right">{formatCurrency(item.total, data.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Terms</p>
            <p className="text-sm text-muted-foreground">{data.terms}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <p className="text-sm text-muted-foreground">Total Tax</p>
              <p className="text-lg font-semibold">{formatCurrency(data.totalTax, data.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Due</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(data.totalDue, data.currency)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
