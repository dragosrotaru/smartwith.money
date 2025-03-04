'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'
import { createInvoice } from '@/modules/invoices/actions'
import { toast } from 'sonner'
import { InvoiceCompany } from '@/modules/invoices/model'

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
      terms: 'Due upon receipt',
      currency: 'CAD',
    },
  })

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <FormControl>
                  <Input {...field} />
                </FormControl>
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

          {form.watch('items').map((_, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.tax`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.taxType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Type</FormLabel>
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
                </div>

                {index > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      const items = form.getValues('items')
                      form.setValue(
                        'items',
                        items.filter((_, i) => i !== index),
                      )
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Item
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
    </Form>
  )
}
