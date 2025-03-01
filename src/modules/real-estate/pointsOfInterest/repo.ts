import { PointsOfInterest } from './model'
import { db } from '@/lib/db'
import { pointsOfInterest } from './model'
import { eq } from 'drizzle-orm'

export async function add(data: PointsOfInterest) {
  return db.insert(pointsOfInterest).values(data)
}

export async function remove(id: string) {
  return db.delete(pointsOfInterest).where(eq(pointsOfInterest.id, id))
}

export async function getById(id: string) {
  return db.select().from(pointsOfInterest).where(eq(pointsOfInterest.id, id))
}

export async function getAllByAccountId(accountId: string) {
  return db.select().from(pointsOfInterest).where(eq(pointsOfInterest.accountId, accountId))
}
