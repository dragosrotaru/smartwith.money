import { sql } from 'drizzle-orm'
import { text, timestamp, pgTable, pgEnum, index, uuid } from 'drizzle-orm/pg-core'

// Enums
export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'archived'])

// Tables
export const blogCategories = pgTable('blog_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at')
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`now()`)
    .notNull(),
})

export const blogAuthors = pgTable('blog_authors', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at')
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`now()`)
    .notNull(),
})

export const blogTags = pgTable('blog_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at')
    .default(sql`now()`)
    .notNull(),
})

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),
    featuredImage: text('featured_image'),
    status: postStatusEnum('status').default('draft').notNull(),
    categoryId: uuid('category_id').references(() => blogCategories.id),
    authorId: uuid('author_id')
      .references(() => blogAuthors.id)
      .notNull(),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    slugIdx: index('blog_posts_slug_idx').on(table.slug),
    categoryIdx: index('blog_posts_category_idx').on(table.categoryId),
    authorIdx: index('blog_posts_author_idx').on(table.authorId),
    publishedAtIdx: index('blog_posts_published_at_idx').on(table.publishedAt),
  }),
)

export const blogPostTags = pgTable(
  'blog_post_tags',
  {
    postId: uuid('post_id')
      .references(() => blogPosts.id)
      .notNull(),
    tagId: uuid('tag_id')
      .references(() => blogTags.id)
      .notNull(),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    pk: index('blog_post_tags_pk').on(table.postId, table.tagId),
  }),
)

// Types
export type BlogCategory = typeof blogCategories.$inferSelect
export type BlogAuthor = typeof blogAuthors.$inferSelect
export type BlogTag = typeof blogTags.$inferSelect
export type BlogPost = typeof blogPosts.$inferSelect
export type BlogPostTag = typeof blogPostTags.$inferSelect

// Insert Types
export type NewBlogCategory = typeof blogCategories.$inferInsert
export type NewBlogAuthor = typeof blogAuthors.$inferInsert
export type NewBlogTag = typeof blogTags.$inferInsert
export type NewBlogPost = typeof blogPosts.$inferInsert
export type NewBlogPostTag = typeof blogPostTags.$inferInsert
