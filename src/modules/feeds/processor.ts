import Parser from 'rss-parser'
import { generateObject } from 'ai'
import { z } from 'zod'
import { JSDOM } from 'jsdom'
import { createFeedItem, getFeedItemByExternalId, markFeedSourceChecked, updateFeedItem } from './service'
import { type FeedSource, type FeedItem } from './model'
import { createBlogPost } from '../blog/service'
import { BlogPost } from '../blog/model'
import { sendArticleNotification } from '../notifications/email'
import { openai } from '@ai-sdk/openai'

const parser = new Parser()

const processedContentSchema = z.object({
  title: z.string(),
  content: z.string(),
  excerpt: z.string(),
  category: z.enum(['tax', 'housing', 'finance', 'investing']),
  tags: z.array(z.string()),
})

type ProcessedContent = z.infer<typeof processedContentSchema>

// Track generated articles across all feed sources
let generatedArticles: BlogPost[] = []

async function scrapeArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const html = await response.text()

    // Parse HTML using jsdom
    const dom = new JSDOM(html)
    const doc = dom.window.document

    // Extract article content using common article selectors
    const selectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.content-primary',
      '.article-body',
      'main',
      '#main-content', // Common in government sites
      '.canada-main', // Canada.ca specific
      '.mrgn-tp-md', // Canada.ca specific
    ]

    // Try each selector until we find content
    for (const selector of selectors) {
      const element = doc.querySelector(selector)
      if (element) {
        // Clean up the content
        const content = cleanArticleContent(element.textContent || '')
        if (content.length > 100) {
          // Ensure we got meaningful content
          return content
        }
      }
    }

    // Fallback: Try to get the main content area
    const body = doc.body
    if (body) {
      return cleanArticleContent(body.textContent || '')
    }

    throw new Error('Could not extract article content')
  } catch (error) {
    console.error('Error scraping article:', url, error)
    throw error
  }
}

function cleanArticleContent(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .replace(/\t+/g, ' ') // Replace tabs with spaces
    .replace(/\r/g, '') // Remove carriage returns
    .trim()
}

export async function processFeedSource(source: FeedSource): Promise<void> {
  try {
    const feed = await parser.parseURL(source.url)

    for (const item of feed.items) {
      if (!item.guid || !item.title || !item.link) continue

      // Check if we've already processed this item
      const existingItem = await getFeedItemByExternalId(source.id, item.guid)
      if (existingItem) continue

      try {
        // Scrape the full article content
        const fullContent = await scrapeArticleContent(item.link)

        // Create new feed item
        const feedItem = await createFeedItem({
          sourceId: source.id,
          externalId: item.guid,
          title: item.title,
          content: fullContent,
          url: item.link,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          status: 'pending',
        })

        // Process the item
        await processItem(feedItem)
      } catch (error) {
        console.error('Error processing feed item:', item.guid, error)
        continue
      }
    }

    // Update last checked timestamp
    await markFeedSourceChecked(source.id)
  } catch (error) {
    console.error('Error processing feed source:', source.name, error)
  }
}

async function processItem(item: FeedItem): Promise<void> {
  try {
    // Update status to processing
    await updateFeedItem(item.id, { status: 'processing' })

    // Check relevance
    const isRelevant = await checkRelevance(item)
    if (!isRelevant) {
      await updateFeedItem(item.id, { status: 'not-relevant' })
      return
    }

    // Generate content
    const processedContent = await generateContent(item)

    // Create blog post
    const blogPost = await createBlogPost(
      {
        title: processedContent.title,
        slug: generateSlug(processedContent.title),
        content: processedContent.content,
        excerpt: processedContent.excerpt,
        status: 'draft',
        categoryId: null, // Will be set based on the AI categorization
        authorId: process.env.AI_AUTHOR_ID!, // Use a dedicated AI author
      },
      processedContent.tags,
    )

    // Add to generated articles
    generatedArticles.push(blogPost)

    // Update feed item status
    await updateFeedItem(item.id, {
      status: 'completed',
      blogPostId: blogPost.id,
      processedAt: new Date(),
    })
  } catch (error) {
    console.error('Error processing feed item:', item.id, error)
    await updateFeedItem(item.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Function to send notification for all generated articles
export async function sendBatchNotification(): Promise<void> {
  if (generatedArticles.length === 0) return

  try {
    await sendArticleNotification(generatedArticles)
    // Clear the articles array after sending notification
    generatedArticles = []
  } catch (error) {
    console.error('Error sending batch notification:', error)
  }
}

async function checkRelevance(item: FeedItem): Promise<boolean> {
  const { object } = await generateObject({
    model: openai('o1'),
    schema: z.object({
      isRelevant: z.boolean(),
    }),
    messages: [
      {
        role: 'system',
        content:
          'You are an AI that determines if news content is relevant to personal finance, taxes, housing, or investing in Canada.',
      },
      {
        role: 'user',
        content: `Title: ${item.title}\n\nContent: ${item.content}\n\nIs this content relevant? Answer with just "yes" or "no".`,
      },
    ],
    temperature: 0,
  })

  return object.isRelevant
}

async function generateContent(item: FeedItem): Promise<ProcessedContent> {
  const { object } = await generateObject({
    model: openai('o1'),
    schema: processedContentSchema,
    messages: [
      {
        role: 'system',
        content: `You are an AI that transforms government news into engaging blog posts about Canadian personal finance.
          Create a blog post that explains the implications for Canadians.
          The response must include:
          - An SEO-optimized title
          - The full blog post in markdown format
          - A compelling 2-3 sentence excerpt
          - A category (one of: tax, housing, finance, investing)
          - Relevant tags`,
      },
      {
        role: 'user',
        content: `Original Title: ${item.title}\n\nOriginal Content: ${item.content}\n\nSource URL: ${item.url}`,
      },
    ],
    temperature: 0.7,
  })

  return object
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
