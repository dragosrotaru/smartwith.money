'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface BannerProps {
  id: string
  message: string
  variant?: 'default' | 'warning' | 'error' | 'success'
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  children?: ReactNode
  className?: string
}

const variantStyles = {
  default: 'bg-background border-border',
  warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
  error: 'bg-destructive/10 border-destructive/20',
  success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
}

export function Banner({ message, variant = 'default', action, onDismiss, children, className }: BannerProps) {
  return (
    <div
      className={cn(
        'relative flex items-center gap-4 rounded-lg border p-4 text-sm ',
        variantStyles[variant],
        className,
      )}
      role="alert"
    >
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {children}
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <Button variant="outline" size="sm" onClick={action.onClick} className="whitespace-nowrap">
            {action.label}
          </Button>
        )}
        {onDismiss && (
          <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </div>
  )
}
