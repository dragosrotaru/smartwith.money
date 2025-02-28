'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createExportJob, downloadExport, getExportJobs, withOwnerAccess } from '@/modules/account/actions'
import { ExportJobStatus } from '@/modules/account/model'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Download, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

type ExportJob = {
  id: string
  status: ExportJobStatus
  error: string | null
  downloadUrl: string | null
  createdAt: Date
  completedAt: Date | null
  requestedBy: {
    id: string
    name: string | null
    email: string | null
  }
}

export function ExportSection({ accountId }: { accountId: string }) {
  const [jobs, setJobs] = useState<ExportJob[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      const auth = await withOwnerAccess(accountId)
      if (auth instanceof Error) {
        setIsOwner(false)
        setLoading(false)
        return
      }
      setIsOwner(true)
      loadJobs()
    }
    checkAccess()
  }, [accountId])

  const loadJobs = async () => {
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
      setLoading(false)
    }
  }

  const handleCreateExport = async () => {
    setIsCreatingJob(true)
    try {
      const result = await createExportJob(accountId)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      toast.success('Export job created successfully')
      loadJobs()
    } catch {
      toast.error('Failed to create export job')
    } finally {
      setIsCreatingJob(false)
    }
  }

  const handleDownload = async (jobId: string) => {
    setIsDownloading(jobId)
    try {
      const result = await downloadExport(jobId)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      // Create a temporary link and click it to start the download
      const link = document.createElement('a')
      link.href = result.url
      link.download = `account-export-${jobId}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      toast.error('Failed to download export')
    } finally {
      setIsDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <Alert>
        <div className="flex align-middle gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 self-center" />
          <AlertDescription className="m-0">
            You must be an owner of this account to access data export functionality.
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleCreateExport} disabled={isCreatingJob}>
          {isCreatingJob ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Export...
            </>
          ) : (
            'Export Account Data'
          )}
        </Button>
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
                    {job.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                    <span
                      className={cn(
                        job.status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : job.status === 'failed'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-muted-foreground',
                      )}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatDistanceToNow(job.createdAt, { addSuffix: true })}</TableCell>
                <TableCell>
                  {job.completedAt ? formatDistanceToNow(job.completedAt, { addSuffix: true }) : '-'}
                </TableCell>
                <TableCell>
                  {job.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(job.id)}
                      disabled={isDownloading === job.id}
                    >
                      {isDownloading === job.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {job.status === 'failed' && (
                    <span className="text-sm text-red-600 dark:text-red-400" title={job.error || undefined}>
                      Failed
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No export jobs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
