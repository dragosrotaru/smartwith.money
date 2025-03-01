import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import React from 'react'
import { Label } from '@/components/ui/label'

interface ValueWithExplanationProps {
  label: string
  value: number | string
  explanation: string | React.ReactNode
  type?: 'currency' | 'percentage' | 'text'
  children?: React.ReactNode
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'percent', minimumFractionDigits: 2 }).format(value / 100)
}

export function ValueWithExplanation({
  label,
  value,
  explanation,
  type = 'text',
  children,
}: ValueWithExplanationProps) {
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'string') return value
    switch (type) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercentage(value)
      default:
        return value.toString()
    }
  }, [value, type])

  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {children || formattedValue}
        <HoverCard>
          <HoverCardTrigger>
            <InfoCircledIcon className="h-4 w-4 text-muted-foreground cursor-help" />
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <p className="text-sm">{explanation}</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  )
}
