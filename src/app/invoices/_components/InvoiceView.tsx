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
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${data.invoiceNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 2cm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Invoice #{data.invoiceNumber}</h1>
        <Button onClick={() => handlePrint()} variant="outline" className="flex items-center gap-2 print:hidden">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div ref={printRef}>
          <Invoice data={data} className="print:shadow-none print:p-0" />
        </div>
      </div>
    </div>
  )
}
