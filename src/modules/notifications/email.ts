import { ServerClient } from 'postmark'
import type { BlogPost } from '../blog/model'
import type { AccountRole } from '../account/model'
import { menu } from '@/lib/menu'
import { eq } from 'drizzle-orm'
import { users } from '@/modules/account/model'
import { db } from '@/lib/db'

const postmark = new ServerClient(process.env.POSTMARK_API_KEY!)

type InviteEmailParams = {
  email: string
  accountName: string
  role: AccountRole
}

export async function sendInviteEmail({ email, accountName, role }: InviteEmailParams): Promise<void> {
  await postmark.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL!,
    To: email,
    Subject: `You've been invited to join ${accountName} on Smart With Money`,
    HtmlBody: generateInviteEmailTemplate({ accountName, role }),
    MessageStream: 'outbound',
  })
}

function generateInviteEmailTemplate({ accountName, role }: Omit<InviteEmailParams, 'email'>): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">You've Been Invited!</h1>
      
      <div style="margin: 24px 0;">
        <h2 style="color: #1f2937;">Join ${accountName} on Smart With Money</h2>
        <p style="color: #4b5563;">
          You've been invited to join ${accountName} on Smart With Money.
          Smart With Money helps you make smarter financial decisions about real estate and more.
        </p>
      </div>

      <div style="margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #1f2937; margin: 0 0 8px 0;">Account Details</h3>
        <p style="color: #4b5563; margin: 8px 0;">
          <strong>Account:</strong> ${accountName}<br>
          <strong>Your Role:</strong> ${role}<br>
        </p>
        <div style="margin: 24px 0;">
          <a
            href="${process.env.APP_URL}${menu.signin.href}"
            style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;"
          >
            Sign in to Accept Invitation
          </a>
        </div>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        This invitation will expire in 7 days. If you don't have an account, you'll be able to create one when accepting the invitation.
      </p>
    </div>
  `
}

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
            <span style="color: #6b7280; font-size: 14px;">ID: ${article.id}</span>
            <span style="color: #6b7280; font-size: 14px; margin-left: 16px;">Status: ${article.status}</span>
            <span style="color: #6b7280; font-size: 14px; margin-left: 16px;">Created: ${article.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      `,
        )
        .join('')}

      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        These articles were automatically generated from news feeds and require your review. Please check the database using the provided IDs to review and publish them.
      </p>
    </div>
  `
}

export async function sendExportReadyEmail(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user?.email) return

  await postmark.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL!,
    To: user.email,
    Subject: 'Your Account Data Export is Ready',
    HtmlBody: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Your Export is Ready</h1>
        
        <div style="margin: 24px 0;">
          <p style="color: #4b5563;">Hello ${user.name || 'there'},</p>
          <p style="color: #4b5563;">Your account data export is now ready for download.</p>
          
          <div style="margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <a
              href="${process.env.APP_URL}${menu.account.href}"
              style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;"
            >
              Download from Account Settings
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            You can download your data from the Account Settings page. The export will be available for 7 days.
          </p>
        </div>
        
        <p style="color: #4b5563;">Best regards,<br>Finance App Team</p>
      </div>
    `,
    MessageStream: 'outbound',
  })
}
