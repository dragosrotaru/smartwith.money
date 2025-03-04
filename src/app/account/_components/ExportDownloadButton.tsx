'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { downloadExport } from '@/modules/account/actions'

export default function ExportDownloadButton({ jobId }: { jobId: string }) {
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const handleDownload = async () => {
    setIsDownloading(true)
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
      setIsDownloading(false)
    }
  }
  return (
    <Button size="sm" variant="ghost" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
    </Button>
  )
}
