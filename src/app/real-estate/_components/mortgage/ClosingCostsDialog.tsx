import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ClosingCostsProps } from '@/modules/real-estate/domain/closingCosts'
import { ClosingCostsCalculator } from './ClosingCostsCalculator'
import React, { useState } from 'react'

interface ClosingCostsDialogProps {
  closingCosts: ClosingCostsProps
  onUpdate: (closingCosts: ClosingCostsProps) => void
}

export function ClosingCostsDialog({ closingCosts, onUpdate }: ClosingCostsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const handleUpdate = (costs: ClosingCostsProps) => {
    onUpdate(costs)
    setIsOpen(false)
  }

  return (
    <>
      <Button variant="link" className="h-auto p-0" onClick={() => setIsOpen(true)}>
        Edit Closing Costs
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Closing Costs Calculator</DialogTitle>
            <DialogDescription>
              Calculate and adjust all closing costs associated with your property purchase.
            </DialogDescription>
          </DialogHeader>
          <ClosingCostsCalculator closingCosts={closingCosts} onUpdate={handleUpdate} />
        </DialogContent>
      </Dialog>
    </>
  )
}
