import { ServerClient } from 'postmark'
import type { BlogPost } from '../blog/model'

const postmark = new ServerClient(process.env.POSTMARK_API_KEY!)

export async function sendArticleNotification(articles: BlogPost | BlogPost[]): Promise<void> {
  const articleList = Array.isArray(articles) ? articles : [articles]

  if (articleList.length === 0) return

  await postmark.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL!,
    To: process.env.ADMIN_EMAIL!,
    Subject: `[Review Required] ${articleList.length} New AI Generated Articles`,
    HtmlBody: generateEmailTemplate(articleList),
    MessageStream: 'outbound',
  })
}

function generateEmailTemplate(articles: BlogPost[]): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">New Articles Ready for Review</h1>
      
      <div style="margin: 24px 0;">
        <h2 style="color: #1f2937;">${articles.length} New Articles Generated</h2>
        <p style="color: #4b5563;">The following articles have been generated and require your review:</p>
      </div>

      ${articles
        .map(
          (article, index) => `
        <div style="margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #1f2937; margin: 0 0 8px 0;">${index + 1}. ${article.title}</h3>
          ${article.excerpt ? `<p style="color: #4b5563; margin: 8px 0;">${article.excerpt}</p>` : ''}
          <div style="margin: 16px 0;">
            <span style="color: #6b7280; font-size: 14px;">Status: ${article.status}</span>
            <span style="color: #6b7280; font-size: 14px; margin-left: 16px;">Created: ${article.createdAt.toLocaleDateString()}</span>
          </div>
          <a
            href="${process.env.NEXT_PUBLIC_APP_URL}/admin/blog/posts/${article.id}"
            style="display: inline-block; background-color: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;"
          >
            Review Article
          </a>
        </div>
      `,
        )
        .join('')}

      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        These articles were automatically generated from news feeds and require your review before publishing.
      </p>
    </div>
  `
}
