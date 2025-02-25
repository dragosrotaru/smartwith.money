import { NextResponse } from 'next/server'
import { getActiveFeedSources } from '@/modules/feeds/service'
import { processFeedSource, sendBatchNotification } from '@/modules/feeds/processor'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get active feed sources
    const sources = await getActiveFeedSources()

    // Process each source
    const results = await Promise.allSettled(sources.map(processFeedSource))

    // Send batch notification for all generated articles
    await sendBatchNotification()

    // Count successes and failures
    const summary = results.reduce(
      (acc, result) => {
        if (result.status === 'fulfilled') {
          acc.success++
        } else {
          acc.failed++
        }
        return acc
      },
      { success: 0, failed: 0 },
    )

    return NextResponse.json({
      message: 'Feed processing completed',
      processed: sources.length,
      ...summary,
    })
  } catch (error) {
    console.error('Error in feed processing cron:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
