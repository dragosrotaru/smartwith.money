'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AccountExportJobViewModel, getExportJobs } from '@/modules/account/actions'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { AccessAlert } from '@/components/AccessAlert'
import { useWithOwnerAccess } from '@/hooks/use-with-access'
import { SectionSkeleton } from './SectionSkeleton'
import ExportJobStatus from './ExportJobStatus'
import ExportCreateButton from './ExportCreateButton'
import ExportDownloadButton from './ExportDownloadButton'

export function ExportSection({ accountId }: { accountId: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [jobs, setJobs] = useState<AccountExportJobViewModel[]>([])

  const { isOwner, isLoadingAccess } = useWithOwnerAccess(accountId)

  const loadJobs = useCallback(async () => {
    try {
      const result = await getExportJobs(accountId)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      setJobs(result)
    } catch {
      toast.error('Failed to load export jobs')
    } finally {
      setIsLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    loadJobs()
  }, [accountId, loadJobs])

  if (isLoading || isLoadingAccess) return <SectionSkeleton />
  if (!isOwner) return <AccessAlert message="Only account owners can export account data." />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ExportCreateButton accountId={accountId} reloadJobs={loadJobs} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requested By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No export jobs found
                </TableCell>
              </TableRow>
            )}
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{job.requestedBy.name}</div>
                    <div className="text-sm text-muted-foreground">{job.requestedBy.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ExportJobStatus jobStatus={job.status} error={job.error} />
                  </div>
                </TableCell>
                <TableCell>{formatDistanceToNow(job.createdAt, { addSuffix: true })}</TableCell>
                <TableCell>
                  {job.completedAt ? formatDistanceToNow(job.completedAt, { addSuffix: true }) : '-'}
                </TableCell>
                <TableCell>
                  <ExportDownloadButton jobId={job.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
