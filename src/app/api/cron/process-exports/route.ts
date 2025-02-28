import { db } from '@/lib/db'
import { accountExportJobs } from '@/modules/account/model'
import { processExport } from '@/modules/account/process-exports'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  // Verify that the request is coming from Vercel Cron
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Get pending jobs
    const jobs = await db
      .select({
        id: accountExportJobs.id,
      })
      .from(accountExportJobs)
      .where(eq(accountExportJobs.status, 'pending'))

    // Process each job
    for (const job of jobs) {
      await processExport(job.id)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Failed to process export jobs:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
