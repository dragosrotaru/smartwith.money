import type { Mortgage } from '@/modules/house/domain/mortgage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MortgageDisplayProps {
  mortgage: Mortgage
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount)
}

function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'percent', minimumFractionDigits: 2 }).format(value / 100)
}

export function MortgageDisplay({ mortgage }: MortgageDisplayProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt>Purchase Price:</dt>
              <dd>{formatCurrency(mortgage.purchasePrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Down Payment:</dt>
              <dd>{formatCurrency(mortgage.downPayment)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Loan Principal:</dt>
              <dd>{formatCurrency(mortgage.loanPrincipal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Interest Rate:</dt>
              <dd>{formatPercentage(mortgage.interestRate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Amortization:</dt>
              <dd>{mortgage.amortizationYears} years</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt>Payment Frequency:</dt>
              <dd>{mortgage.paymentFrequency}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Payment Amount:</dt>
              <dd>{formatCurrency(mortgage.payment)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Monthly Payment:</dt>
              <dd>{formatCurrency(mortgage.monthlyPayment)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Total Payments:</dt>
              <dd>{mortgage.numberOfPayments}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Total Interest:</dt>
              <dd>{formatCurrency(mortgage.totalInterest)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt>Mortgage Insurance:</dt>
              <dd>{formatCurrency(mortgage.mortgageInsurance.premium)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Land Transfer Tax:</dt>
              <dd>{formatCurrency(mortgage.landTransferTax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Total Fees:</dt>
              <dd>{formatCurrency(mortgage.totalFees)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Cash Needed Upfront:</dt>
              <dd>{formatCurrency(mortgage.cashNeededUpFront)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
