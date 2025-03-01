import { Alert, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function AccessAlert({ message }: { message: string }) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  )
}
