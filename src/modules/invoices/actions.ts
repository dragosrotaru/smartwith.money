'use server'

import { db } from '@/lib/db'
import { eq, asc, and } from 'drizzle-orm'
import { InvoiceData } from '@/app/invoices/_components/Invoice'
import {
  invoices,
  invoiceItems,
  Invoice,
  NewInvoice,
  NewInvoiceItem,
  companies,
  InvoiceCompany,
  InvoiceCompanyNew,
} from './model'
import { alias } from 'drizzle-orm/pg-core'
import { withReadAccess, withReadWriteAccess } from '@/modules/account/actions'

interface InvoiceInput {
  number: string
  date: Date
  fromCompanyId: string
  toCompanyId: string
  items: Array<{
    description: string
    amount: number
    tax: number
    taxType: string
  }>
  terms: string
  currency: string
}

export interface InvoiceListItem {
  id: string
  number: string
  date: Date
  fromCompany: {
    name: string
  }
  toCompany: {
    name: string
  }
  totalAmount: number
  currency: string
}

export async function getInvoicesForActiveAccount(): Promise<InvoiceListItem[] | Error> {
  const auth = await withReadAccess()
  if (auth instanceof Error) return auth

  const fromCompanyAlias = alias(companies, 'from_company')
  const toCompanyAlias = alias(companies, 'to_company')

  try {
    const result = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        date: invoices.date,
        currency: invoices.currency,
        fromCompany: {
          name: fromCompanyAlias.name,
        },
        toCompany: {
          name: toCompanyAlias.name,
        },
        items: invoiceItems,
      })
      .from(invoices)
      .leftJoin(invoiceItems, eq(invoiceItems.invoiceId, invoices.id))
      .leftJoin(fromCompanyAlias, eq(fromCompanyAlias.id, invoices.fromCompanyId))
      .leftJoin(toCompanyAlias, eq(toCompanyAlias.id, invoices.toCompanyId))
      .where(eq(fromCompanyAlias.accountId, auth.activeAccountId))
      .execute()

    // Group by invoice and calculate totals
    const invoiceMap = new Map<string, InvoiceListItem>()

    for (const row of result) {
      if (!row.fromCompany || !row.toCompany) continue

      if (!invoiceMap.has(row.id)) {
        invoiceMap.set(row.id, {
          id: row.id,
          number: row.number,
          date: row.date,
          fromCompany: {
            name: row.fromCompany.name,
          },
          toCompany: {
            name: row.toCompany.name,
          },
          totalAmount: 0,
          currency: row.currency,
        })
      }

      if (row.items) {
        const invoice = invoiceMap.get(row.id)!
        invoice.totalAmount += Number(row.items.amount) + Number(row.items.tax)
      }
    }

    return Array.from(invoiceMap.values())
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return new Error('Failed to fetch invoices')
  }
}

export async function getInvoiceById(id: string): Promise<InvoiceData | Error | null> {
  const auth = await withReadAccess()
  if (auth instanceof Error) return auth

  try {
    const fromCompanyAlias = alias(companies, 'from_company')
    const toCompanyAlias = alias(companies, 'to_company')

    const result = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.accountId, auth.activeAccountId)))
      .leftJoin(invoiceItems, eq(invoiceItems.invoiceId, invoices.id))
      .leftJoin(fromCompanyAlias, eq(fromCompanyAlias.id, invoices.fromCompanyId))
      .leftJoin(toCompanyAlias, eq(toCompanyAlias.id, invoices.toCompanyId))
      .execute()

    if (!result?.length) return null

    const invoice = result[0].invoice
    const items = result.map((r) => r.invoice_item).filter((item): item is NonNullable<typeof item> => item !== null)
    const fromCompany = result[0].from_company
    const toCompany = result[0].to_company

    if (!fromCompany || !toCompany) return null

    return {
      invoiceNumber: invoice.number,
      invoiceDate: invoice.date,
      from: {
        companyName: fromCompany.name,
        address: [
          fromCompany.address,
          fromCompany.city,
          `${fromCompany.state} ${fromCompany.postalCode}`,
          fromCompany.country,
        ],
        businessNumber: fromCompany.businessNumber ?? '',
        taxNumber: fromCompany.taxNumber ?? '',
        contactName: fromCompany.contactName,
        email: fromCompany.email,
      },
      to: {
        companyName: toCompany.name,
        address: [toCompany.address, toCompany.city, `${toCompany.state} ${toCompany.postalCode}`, toCompany.country],
        contactName: toCompany.contactName,
        email: toCompany.email,
      },
      items: items.map((item) => ({
        description: item.description,
        amount: Number(item.amount),
        tax: Number(item.tax),
        taxType: item.taxType,
        total: Number(item.amount) + Number(item.tax),
      })),
      terms: invoice.terms,
      totalTax: items.reduce((sum: number, item) => sum + Number(item.tax), 0),
      totalDue: items.reduce((sum: number, item) => sum + Number(item.amount) + Number(item.tax), 0),
      currency: invoice.currency,
    }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return new Error('Failed to fetch invoice')
  }
}

export async function createInvoice(data: InvoiceInput): Promise<Invoice | Error> {
  const auth = await withReadWriteAccess()
  if (auth instanceof Error) return auth

  try {
    return await db.transaction(async (tx) => {
      const [invoice] = await tx
        .insert(invoices)
        .values({
          accountId: auth.activeAccountId,
          number: data.number,
          date: data.date,
          fromCompanyId: data.fromCompanyId,
          toCompanyId: data.toCompanyId,
          terms: data.terms,
          currency: data.currency,
        } satisfies Omit<NewInvoice, 'id' | 'createdAt' | 'updatedAt'>)
        .returning()

      await tx.insert(invoiceItems).values(
        data.items.map(
          (item) =>
            ({
              description: item.description,
              amount: item.amount.toString(),
              tax: item.tax.toString(),
              taxType: item.taxType,
              invoiceId: invoice.id,
            }) satisfies Omit<NewInvoiceItem, 'id'>,
        ),
      )

      return invoice
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return new Error('Failed to create invoice')
  }
}

export async function deleteInvoice(id: string): Promise<Error | void> {
  const auth = await withReadWriteAccess()
  if (auth instanceof Error) return auth

  await db.transaction(async (tx) => {
    await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id))
    await tx.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.accountId, auth.activeAccountId)))
  })
}

export async function getCompaniesForInvoice(): Promise<InvoiceCompany[] | Error> {
  const auth = await withReadAccess()
  if (auth instanceof Error) return auth

  const companyList = await db
    .select()
    .from(companies)
    .where(eq(companies.accountId, auth.activeAccountId))
    .orderBy(asc(companies.name))

  return companyList
}

export async function createCompany(data: Omit<InvoiceCompanyNew, 'accountId'>): Promise<InvoiceCompany | Error> {
  const auth = await withReadWriteAccess()
  if (auth instanceof Error) return auth

  try {
    const [company] = await db
      .insert(companies)
      .values({
        accountId: auth.activeAccountId,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        businessNumber: data.businessNumber || null,
        taxNumber: data.taxNumber || null,
        contactName: data.contactName,
        email: data.email,
      })
      .returning()

    return company
  } catch (error) {
    console.error('Error creating company:', error)
    return new Error('Failed to create company')
  }
}

export async function getCompaniesForActiveAccount(): Promise<InvoiceCompany[] | Error> {
  const auth = await withReadAccess()
  if (auth instanceof Error) return auth

  try {
    const result = await db
      .select()
      .from(companies)
      .where(eq(companies.accountId, auth.activeAccountId))
      .orderBy(asc(companies.name))

    return result
  } catch (error) {
    console.error('Error fetching companies:', error)
    return new Error('Failed to fetch companies')
  }
}
