import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type LoaderProps = {
  size?: number
  className?: string
}

export default function Loader({ size = 24, className }: LoaderProps) {
  return <Loader2 className={cn('animate-spin', className)} style={{ width: size, height: size }} />
}
