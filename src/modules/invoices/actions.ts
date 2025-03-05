'use server'

import { db } from '@/lib/db'
import { eq, asc } from 'drizzle-orm'
import { InvoiceData } from '@/app/invoices/_components/Invoice'
import { invoices, invoiceItems, Invoice, NewInvoice, NewInvoiceItem, companies } from './model'
import { alias } from 'drizzle-orm/pg-core'
import { withReadAccess } from '@/modules/account/actions'

interface InvoiceInput {
  number: string
  date: Date
  accountId: string
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

export async function getInvoicesByAccountId(accountId: string): Promise<InvoiceListItem[] | Error> {
  const auth = await withReadAccess(accountId)
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
      .where(eq(fromCompanyAlias.accountId, accountId))
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

export async function getInvoiceById(id: string): Promise<InvoiceData | null> {
  try {
    const fromCompanyAlias = alias(companies, 'from_company')
    const toCompanyAlias = alias(companies, 'to_company')

    const result = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
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
    return null
  }
}

export async function createInvoice(data: InvoiceInput): Promise<Invoice | null> {
  try {
    return await db.transaction(async (tx) => {
      const [invoice] = await tx
        .insert(invoices)
        .values({
          number: data.number,
          date: data.date,
          accountId: data.accountId,
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
    return null
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id))
    await tx.delete(invoices).where(eq(invoices.id, id))
  })
}

export async function getCompaniesForInvoice(accountId: string) {
  const companyList = await db
    .select()
    .from(companies)
    .where(eq(companies.accountId, accountId))
    .orderBy(asc(companies.name))

  return companyList
}

interface CompanyInput {
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  businessNumber?: string
  taxNumber?: string
  contactName: string
  email: string
  accountId: string
}

export async function createCompany(data: CompanyInput) {
  try {
    const [company] = await db
      .insert(companies)
      .values({
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
        accountId: data.accountId,
      })
      .returning()

    return company
  } catch (error) {
    console.error('Error creating company:', error)
    return null
  }
}

export interface CompanyListItem {
  id: string
  name: string
  email: string
  contactName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

export async function getCompaniesByAccountId(accountId: string): Promise<CompanyListItem[] | Error> {
  const auth = await withReadAccess(accountId)
  if (auth instanceof Error) return auth

  try {
    const result = await db
      .select({
        id: companies.id,
        name: companies.name,
        email: companies.email,
        contactName: companies.contactName,
        address: companies.address,
        city: companies.city,
        state: companies.state,
        postalCode: companies.postalCode,
        country: companies.country,
      })
      .from(companies)
      .where(eq(companies.accountId, accountId))
      .orderBy(asc(companies.name))

    return result
  } catch (error) {
    console.error('Error fetching companies:', error)
    return new Error('Failed to fetch companies')
  }
}
