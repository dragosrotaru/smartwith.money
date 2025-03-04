'use client'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Invoice } from './Invoice'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { InvoiceData } from './Invoice'

interface InvoiceViewProps {
  data: InvoiceData
}

export function InvoiceView({ data }: InvoiceViewProps) {
  const componentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${data.invoiceNumber}`,
    pageStyle: '@page { size: A4; margin: 2cm }',
    onAfterPrint: () => console.log('Printed successfully'),
    // @ts-expect-error - types are wrong in react-to-print
    content: () => componentRef.current,
  })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Invoice #{data.invoiceNumber}</h1>
        <Button onClick={() => handlePrint()} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div ref={componentRef}>
        <Invoice data={data} className="max-w-4xl mx-auto print:shadow-none print:p-0" />
      </div>
    </div>
  )
}
