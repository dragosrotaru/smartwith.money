'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Plus } from 'lucide-react'
import { createInvoice } from '@/modules/invoices/actions'
import { toast } from 'sonner'
import { InvoiceCompany } from '@/modules/invoices/model'
import Link from 'next/link'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CompanyCombobox } from './CompanyCombobox'

const TAX_RATES = {
  'HST (13%)': 0.13,
  'GST (5%)': 0.05,
} as const

const PAYMENT_TERMS = {
  due_upon_receipt: 'Due upon receipt',
  net_15: 'Net 15',
  net_30: 'Net 30',
  net_45: 'Net 45',
  net_60: 'Net 60',
  custom: 'Custom',
} as const

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  tax: z.coerce.number().min(0, 'Tax must be positive'),
  taxType: z.string().min(1, 'Tax type is required'),
})

const formSchema = z.object({
  number: z.string().min(1, 'Invoice number is required'),
  date: z.string().min(1, 'Date is required'),
  fromCompanyId: z.string().uuid('Invalid company'),
  toCompanyId: z.string().uuid('Invalid company'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  terms: z.string().min(1, 'Terms are required'),
  currency: z.string().min(1, 'Currency is required'),
})

type FormValues = z.infer<typeof formSchema>

interface InvoiceFormProps {
  accountId: string
  companies: InvoiceCompany[]
}

export function InvoiceForm({ accountId, companies }: InvoiceFormProps) {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      items: [{ description: '', amount: 0, tax: 0, taxType: 'HST (13%)' }],
      terms: PAYMENT_TERMS.due_upon_receipt,
      currency: 'CAD',
    },
  })

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (!name?.includes('items') || !type) return

      const match = name.match(/items\.(\d+)\.(amount|taxType)/)
      if (!match) return

      const index = parseInt(match[1])
      const field = match[2]

      if (field === 'amount' || field === 'taxType') {
        const item = form.getValues(`items.${index}`)
        const amount = Number(item.amount)
        const taxRate = TAX_RATES[item.taxType as keyof typeof TAX_RATES] || 0
        const calculatedTax = Number((amount * taxRate).toFixed(2))

        form.setValue(`items.${index}.tax`, calculatedTax, {
          shouldValidate: true,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await createInvoice({
        ...data,
        accountId,
        date: new Date(data.date),
      })

      if (!result) throw new Error('Failed to create invoice')

      toast.success('Invoice created successfully')
      router.push(`/invoices/${result.id}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to create invoice:', error)
      toast.error('Failed to create invoice')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fromCompanyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Company</FormLabel>
                <FormControl>
                  <CompanyCombobox
                    companies={companies}
                    value={field.value}
                    onChange={field.onChange}
                    accountId={accountId}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toCompanyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Company</FormLabel>
                <FormControl>
                  <CompanyCombobox
                    companies={companies}
                    value={field.value}
                    onChange={field.onChange}
                    accountId={accountId}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PAYMENT_TERMS).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Items</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const items = form.getValues('items')
                form.setValue('items', [...items, { description: '', amount: 0, tax: 0, taxType: 'HST (13%)' }])
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tax Type</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.watch('items').map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                className={cn(
                                  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.taxType`}
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="HST (13%)">HST (13%)</SelectItem>
                                <SelectItem value="GST (5%)">GST (5%)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.tax`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                disabled
                                className={cn(
                                  'bg-muted',
                                  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const items = form.getValues('items')
                            form.setValue(
                              'items',
                              items.filter((_, i) => i !== index),
                            )
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/invoices">Back to Invoices</Link>
          </Button>
          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
    </Form>
  )
}
