import { FILES, readFile, writeFile } from '../repo'
import { fromHouseSigma } from '.'
import { HouseSigma } from './schema'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { housesigmaRaw, houseSigma } from './model'

// deprecated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadOrGenHouseSigma(propertyId: string, hasBasicFile: boolean, hsFile: any): HouseSigma {
  if (!hasBasicFile) {
    const houseSigma = fromHouseSigma(hsFile)
    writeFile(propertyId, FILES.basic, houseSigma)
    return houseSigma
  } else {
    return readFile(propertyId, FILES.basic)
  }
}

export async function getAllByAccountId(accountId: string): Promise<HouseSigma[]> {
  const result = await db
    .select({
      data: housesigmaRaw.data,
    })
    .from(housesigmaRaw)
    .innerJoin(houseSigma, eq(housesigmaRaw.id, houseSigma.housesigmaId))
    .where(eq(houseSigma.accountId, accountId))

  return result.map((row) => fromHouseSigma(row.data))
}

export async function getById(id: string): Promise<HouseSigma | Error> {
  const [result] = await db
    .select({
      data: housesigmaRaw.data,
    })
    .from(housesigmaRaw)
    .where(eq(housesigmaRaw.id, id))

  if (!result) {
    return new Error(`HouseSigma entry with id ${id} not found`)
  }

  return fromHouseSigma(result.data)
}

export async function add(id: string, data: unknown): Promise<void> {
  await db.transaction(async (tx) => {
    // Get existing account relationships if any
    const existingRelations = await tx
      .select({
        accountId: houseSigma.accountId,
      })
      .from(houseSigma)
      .where(eq(houseSigma.housesigmaId, id))

    // Delete existing housesigma entry if it exists
    await tx.delete(housesigmaRaw).where(eq(housesigmaRaw.id, id))

    // Insert new housesigma entry
    await tx.insert(housesigmaRaw).values({
      id,
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Restore account relationships if there were any
    if (existingRelations.length > 0) {
      await tx.insert(houseSigma).values(
        existingRelations.map((relation) => ({
          accountId: relation.accountId,
          housesigmaId: id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      )
    }
  })
}
