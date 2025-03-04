import { ExportJobStatus as ExportJobStatusType } from '@/modules/account/model'
import { Loader2 } from 'lucide-react'

export default function ExportJobStatus({
  jobStatus,
  error,
}: {
  jobStatus: ExportJobStatusType
  error: string | null
}) {
  if (jobStatus === 'completed') return <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
  if (jobStatus === 'failed') {
    return (
      <span className="text-sm text-red-600 dark:text-red-400" title={error || undefined}>
        Failed
      </span>
    )
  }
  if (jobStatus === 'pending') return <span className="text-sm text-yellow-600 dark:text-yellow-400">Pending</span>
  if (jobStatus === 'processing')
    return (
      <>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-sm text-blue-600 dark:text-blue-400">Processing...</span>
      </>
    )
  if (jobStatus === 'cancelled') return <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
  return <span className="text-sm text-muted-foreground">Unknown</span>
}
