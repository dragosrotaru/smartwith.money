import { db } from '@/lib/db'
import { accountExportJobs, accountUsers, accountPreferences, users } from '@/modules/account/model'
import { pointsOfInterest } from '@/modules/house/pointsOfInterest/model'
import { eq } from 'drizzle-orm'
import { createObjectCsvWriter } from 'csv-writer'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import { uploadExportsFile } from '@/lib/blob'
import { sendExportReadyEmail } from '@/modules/notifications/email'

export async function processExport(jobId: string) {
  try {
    // Update job status to processing
    await db
      .update(accountExportJobs)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(accountExportJobs.id, jobId))

    // Get job details
    const [job] = await db
      .select({
        id: accountExportJobs.id,
        accountId: accountExportJobs.accountId,
        requestedBy: accountExportJobs.requestedBy,
      })
      .from(accountExportJobs)
      .where(eq(accountExportJobs.id, jobId))
      .limit(1)

    if (!job) throw new Error('Job not found')

    // Create temp directory for export files
    const tempDir = join(process.cwd(), 'tmp', job.id)
    await mkdir(tempDir, { recursive: true })

    // Export users
    const exportedUsers = await db
      .select({
        id: accountUsers.userId,
        role: accountUsers.role,
        name: users.name,
        email: users.email,
        createdAt: accountUsers.createdAt,
      })
      .from(accountUsers)
      .innerJoin(users, eq(users.id, accountUsers.userId))
      .where(eq(accountUsers.accountId, job.accountId))

    const usersCsvWriter = createObjectCsvWriter({
      path: join(tempDir, 'users.csv'),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'role', title: 'Role' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'createdAt', title: 'Created At' },
      ],
    })
    await usersCsvWriter.writeRecords(exportedUsers)

    // Export account preferences
    const [preferences] = await db
      .select()
      .from(accountPreferences)
      .where(eq(accountPreferences.accountId, job.accountId))
      .limit(1)

    if (preferences) {
      await writeFile(join(tempDir, 'preferences.json'), JSON.stringify(preferences, null, 2))
    }

    // Export points of interest
    const exportedPOIs = await db.select().from(pointsOfInterest).where(eq(pointsOfInterest.accountId, job.accountId))

    const poisCsvWriter = createObjectCsvWriter({
      path: join(tempDir, 'points_of_interest.csv'),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'address', title: 'Address' },
        { id: 'type', title: 'Type' },
        { id: 'placeId', title: 'Place ID' },
        { id: 'latitude', title: 'Latitude' },
        { id: 'longitude', title: 'Longitude' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' },
      ],
    })
    await poisCsvWriter.writeRecords(exportedPOIs)

    // Create zip file
    const zipPath = join(process.cwd(), 'tmp', `${job.id}.zip`)
    const output = createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    archive.pipe(output)
    archive.directory(tempDir, false)

    await new Promise((resolve, reject) => {
      output.on('close', () => resolve(void 0))
      archive.on('error', reject)
      archive.finalize()
    })

    // Upload to Vercel Blob
    const blobKey = `exports/${job.accountId}/${job.id}.zip`
    const downloadUrl = await uploadExportsFile(zipPath, blobKey)

    // Update job as completed
    await db
      .update(accountExportJobs)
      .set({
        status: 'completed',
        downloadUrl,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(accountExportJobs.id, jobId))

    // Send email notification
    await sendExportReadyEmail(job.requestedBy)
  } catch (error) {
    console.error('Failed to process export job:', error)

    // Update job as failed
    await db
      .update(accountExportJobs)
      .set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date(),
      })
      .where(eq(accountExportJobs.id, jobId))
  }
}
