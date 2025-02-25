import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  blogPosts,
  blogCategories,
  blogPostTags,
  blogTags,
  blogAuthors,
  type BlogPost,
  type BlogCategory,
  type BlogAuthor,
  type BlogTag,
  type NewBlogPost,
} from './model'

export type BlogPostWithRelations = BlogPost & {
  category: BlogCategory | null
  author: BlogAuthor
  tags: BlogTag[]
}

export async function getBlogPost(slug: string): Promise<BlogPostWithRelations | null> {
  const posts = await db
    .select({
      post: blogPosts,
      category: blogCategories,
      author: blogAuthors,
      tags: blogTags,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .innerJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .leftJoin(blogPostTags, eq(blogPosts.id, blogPostTags.postId))
    .leftJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(eq(blogPosts.slug, slug))

  if (!posts.length) return null

  // Group the results to handle multiple tags
  const post = posts[0]
  return {
    ...post.post,
    category: post.category,
    author: post.author,
    tags: posts.map((p) => p.tags).filter((tag): tag is BlogTag => tag !== null),
  }
}

export async function getBlogPosts(options: {
  categorySlug?: string
  page?: number
  limit?: number
}): Promise<{ posts: BlogPostWithRelations[]; total: number }> {
  const { categorySlug, page = 1, limit = 10 } = options
  const offset = (page - 1) * limit

  const conditions = [eq(blogPosts.status, 'published')]
  if (categorySlug) {
    conditions.push(eq(blogCategories.slug, categorySlug))
  }

  const posts = await db
    .select({
      post: blogPosts,
      category: blogCategories,
      author: blogAuthors,
      tags: blogTags,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .innerJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .leftJoin(blogPostTags, eq(blogPosts.id, blogPostTags.postId))
    .leftJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(and(...conditions))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset)

  // Get total count with proper joins
  const countQuery = db.select({ count: sql<number>`count(DISTINCT ${blogPosts.id})` }).from(blogPosts)

  if (categorySlug) {
    countQuery.leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
  }

  const [{ count }] = await countQuery.where(and(...conditions))

  // Group posts by ID to handle multiple tags per post
  const groupedPosts = posts.reduce<Record<string, BlogPostWithRelations>>((acc, row) => {
    if (!acc[row.post.id]) {
      acc[row.post.id] = {
        ...row.post,
        category: row.category,
        author: row.author,
        tags: [],
      }
    }
    if (row.tags) {
      acc[row.post.id].tags.push(row.tags)
    }
    return acc
  }, {})

  return {
    posts: Object.values(groupedPosts),
    total: Number(count),
  }
}

export async function getCategories(): Promise<BlogCategory[]> {
  const categories = await db.select().from(blogCategories)
  return categories
}

export async function createBlogPost(post: NewBlogPost, tagIds: string[]): Promise<BlogPost> {
  const [newPost] = await db.insert(blogPosts).values(post).returning()

  if (tagIds.length > 0) {
    await db.insert(blogPostTags).values(
      tagIds.map((tagId) => ({
        postId: newPost.id,
        tagId,
      })),
    )
  }

  return newPost
}

export async function updateBlogPost(id: string, post: Partial<NewBlogPost>, tagIds?: string[]): Promise<BlogPost> {
  const [updatedPost] = await db
    .update(blogPosts)
    .set({ ...post, updatedAt: new Date() })
    .where(eq(blogPosts.id, id))
    .returning()

  if (tagIds) {
    // Remove existing tags
    await db.delete(blogPostTags).where(eq(blogPostTags.postId, id))

    // Add new tags
    if (tagIds.length > 0) {
      await db.insert(blogPostTags).values(
        tagIds.map((tagId) => ({
          postId: id,
          tagId,
        })),
      )
    }
  }

  return updatedPost
}

export async function deleteBlogPost(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(blogPostTags).where(eq(blogPostTags.postId, id))
    await tx.delete(blogPosts).where(eq(blogPosts.id, id))
  })
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPostWithRelations[]> {
  const posts = await db
    .select({
      post: blogPosts,
      category: blogCategories,
      author: blogAuthors,
      tags: blogTags,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .innerJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .leftJoin(blogPostTags, eq(blogPosts.id, blogPostTags.postId))
    .leftJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(eq(blogPosts.status, 'published'))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)

  // Group posts by ID to handle multiple tags per post
  const groupedPosts = posts.reduce<Record<string, BlogPostWithRelations>>((acc, row) => {
    if (!acc[row.post.id]) {
      acc[row.post.id] = {
        ...row.post,
        category: row.category,
        author: row.author,
        tags: [],
      }
    }
    if (row.tags) {
      acc[row.post.id].tags.push(row.tags)
    }
    return acc
  }, {})

  return Object.values(groupedPosts)
}

export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  limit = 3,
): Promise<BlogPostWithRelations[]> {
  const conditions = [eq(blogPosts.status, 'published'), sql`${blogPosts.id} != ${postId}`]

  if (categoryId) {
    conditions.push(eq(blogPosts.categoryId, categoryId))
  }

  const posts = await db
    .select({
      post: blogPosts,
      category: blogCategories,
      author: blogAuthors,
      tags: blogTags,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .innerJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .leftJoin(blogPostTags, eq(blogPosts.id, blogPostTags.postId))
    .leftJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(and(...conditions))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)

  // Group posts by ID to handle multiple tags per post
  const groupedPosts = posts.reduce<Record<string, BlogPostWithRelations>>((acc, row) => {
    if (!acc[row.post.id]) {
      acc[row.post.id] = {
        ...row.post,
        category: row.category,
        author: row.author,
        tags: [],
      }
    }
    if (row.tags) {
      acc[row.post.id].tags.push(row.tags)
    }
    return acc
  }, {})

  return Object.values(groupedPosts)
}
