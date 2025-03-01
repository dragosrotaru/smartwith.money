import { sql } from 'drizzle-orm'
import { text, timestamp, pgTable, pgEnum, index, uuid, boolean } from 'drizzle-orm/pg-core'
import { blogPosts } from '../blog/model'
import { PROVINCES } from '../location/provinces'

// Enums
export const feedItemStatusEnum = pgEnum('feed_item_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'not-relevant',
])
export const feedCategoryEnum = pgEnum('feed_category', ['tax', 'housing', 'finance', 'investing', 'other'])

// Tables
export const feedSources = pgTable(
  'rss_feed_source',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    url: text('url').notNull(),
    category: feedCategoryEnum('category').notNull(),
    province: text('province', { enum: PROVINCES }), // Only for provincial government feeds
    lastChecked: timestamp('last_checked'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    urlIdx: index('feed_sources_url_idx').on(table.url),
  }),
)

export const feedItems = pgTable(
  'rss_feed_item',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sourceId: uuid('source_id')
      .references(() => feedSources.id)
      .notNull(),
    externalId: text('external_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    url: text('url').notNull(),
    publishedAt: timestamp('published_at').notNull(),
    processedAt: timestamp('processed_at'),
    status: feedItemStatusEnum('status').default('pending').notNull(),
    error: text('error'),
    blogPostId: uuid('blog_post_id').references(() => blogPosts.id),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    sourceIdx: index('feed_items_source_idx').on(table.sourceId),
    externalIdx: index('feed_items_external_idx').on(table.externalId),
    statusIdx: index('feed_items_status_idx').on(table.status),
    blogPostIdx: index('feed_items_blog_post_idx').on(table.blogPostId),
  }),
)

// Types
export type FeedSource = typeof feedSources.$inferSelect
export type NewFeedSource = typeof feedSources.$inferInsert
export type FeedItem = typeof feedItems.$inferSelect
export type NewFeedItem = typeof feedItems.$inferInsert
