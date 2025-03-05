import { Button } from '@/components/ui/button'
import { createExportJob } from '@/modules/account/actions'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ExportCreateButton({ reloadJobs }: { reloadJobs: () => void }) {
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const handleCreateExport = async () => {
    setIsCreatingJob(true)
    try {
      const result = await createExportJob()
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      toast.success('Export job created successfully')
      reloadJobs()
    } catch {
      toast.error('Failed to create export job')
    } finally {
      setIsCreatingJob(false)
    }
  }
  return (
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
  )
}
