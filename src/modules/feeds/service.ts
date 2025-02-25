import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { feedSources, feedItems, type FeedSource, type FeedItem, type NewFeedSource, type NewFeedItem } from './model'

export async function createFeedSource(source: NewFeedSource): Promise<FeedSource> {
  const [newSource] = await db.insert(feedSources).values(source).returning()
  return newSource
}

export async function updateFeedSource(id: string, source: Partial<NewFeedSource>): Promise<FeedSource> {
  const [updatedSource] = await db
    .update(feedSources)
    .set({ ...source, updatedAt: new Date() })
    .where(eq(feedSources.id, id))
    .returning()
  return updatedSource
}

export async function getActiveFeedSources(): Promise<FeedSource[]> {
  return db.select().from(feedSources).where(eq(feedSources.isActive, true))
}

export async function createFeedItem(item: NewFeedItem): Promise<FeedItem> {
  const [newItem] = await db.insert(feedItems).values(item).returning()
  return newItem
}

export async function updateFeedItem(id: string, item: Partial<NewFeedItem>): Promise<FeedItem> {
  const [updatedItem] = await db
    .update(feedItems)
    .set({ ...item, updatedAt: new Date() })
    .where(eq(feedItems.id, id))
    .returning()
  return updatedItem
}

export async function getPendingFeedItems(): Promise<FeedItem[]> {
  return db.select().from(feedItems).where(eq(feedItems.status, 'pending'))
}

export async function getFeedItemByExternalId(sourceId: string, externalId: string): Promise<FeedItem | null> {
  const items = await db
    .select()
    .from(feedItems)
    .where(and(eq(feedItems.sourceId, sourceId), eq(feedItems.externalId, externalId)))
    .limit(1)
  return items[0] || null
}

export async function markFeedSourceChecked(id: string): Promise<void> {
  await db.update(feedSources).set({ lastChecked: new Date() }).where(eq(feedSources.id, id))
}
