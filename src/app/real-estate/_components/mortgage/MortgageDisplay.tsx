import { Mortgage } from '@/modules/real-estate/domain/mortgage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MortgageAmortizationChart } from './MortgageAmortizationChart'
import { MortgagePaymentBreakdownChart } from './MortgagePaymentBreakdownChart'
import { BankRatesChart } from './BankRatesChart'
import { ValueWithExplanation } from '@/components/ValueWithExplanation'
import Link from 'next/link'
import React from 'react'

interface MortgageDisplayProps {
  mortgage: Mortgage
}

export function MortgageDisplay({ mortgage }: MortgageDisplayProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <ValueWithExplanation
                label="Purchase Price"
                value={mortgage.purchasePrice}
                type="currency"
                explanation="The total price of the property you're planning to purchase."
              />
              <ValueWithExplanation
                label="Down Payment"
                value={mortgage.downPayment}
                type="currency"
                explanation="The initial payment you'll make upfront. A larger down payment means lower monthly payments and potentially better interest rates."
              />
              <ValueWithExplanation
                label="Loan Principal"
                value={mortgage.loanPrincipal}
                type="currency"
                explanation="The amount you're borrowing from the lender (purchase price minus down payment)."
              />
              <ValueWithExplanation
                label="Interest Rate"
                value={mortgage.interestRate}
                type="percentage"
                explanation="The annual interest rate on your mortgage. This determines how much you'll pay in interest over the life of the loan."
              />
              <ValueWithExplanation
                label="Amortization"
                value={`${mortgage.amortizationYears} years`}
                explanation="The length of time it will take to pay off your mortgage completely if you make all scheduled payments."
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <ValueWithExplanation
                label="Payment Frequency"
                value={mortgage.paymentFrequency}
                explanation="How often you make mortgage payments. More frequent payments can reduce the total interest paid over time."
              />
              <ValueWithExplanation
                label="Payment Amount"
                value={mortgage.payment}
                type="currency"
                explanation="The amount you'll pay each payment period, including both principal and interest."
              />
              <ValueWithExplanation
                label="Monthly Payment"
                value={mortgage.monthlyPayment}
                type="currency"
                explanation="Your total monthly payment amount, useful for budgeting even if you pay on a different schedule."
              />
              <ValueWithExplanation
                label="Total Payments"
                value={mortgage.numberOfPayments.toString()}
                explanation="The total number of payments you'll make over the life of the mortgage."
              />
              <ValueWithExplanation
                label="Total Interest"
                value={mortgage.totalInterest}
                type="currency"
                explanation="The total amount of interest you'll pay over the life of the mortgage if you make all scheduled payments."
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <ValueWithExplanation
                label="Mortgage Insurance"
                value={mortgage.mortgageInsurance.premium}
                type="currency"
                explanation="CMHC insurance premium required for down payments less than 20%. This protects the lender if you default."
              />
              <ValueWithExplanation
                label="Land Transfer Tax"
                value={mortgage.landTransferTax}
                type="currency"
                explanation="A tax paid to the province when you purchase property. First-time buyers may be eligible for rebates."
              />
              <ValueWithExplanation
                label="Total Fees"
                value={mortgage.totalFees}
                type="currency"
                explanation={
                  <div className="space-y-2">
                    <p>
                      The sum of all additional costs including mortgage insurance, land transfer tax, and other closing
                      costs.
                    </p>
                    <div className="flex items-center gap-4">
                      <Link href="/real-estate/closing-costs" className="text-primary hover:underline">
                        View Closing Costs Guide
                      </Link>
                    </div>
                  </div>
                }
              />
              <ValueWithExplanation
                label="Cash Needed Upfront"
                value={mortgage.cashNeededUpFront}
                type="currency"
                explanation="The total amount you need to have available at closing, including down payment and all fees."
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <MortgageAmortizationChart mortgage={mortgage} />
        <MortgagePaymentBreakdownChart mortgage={mortgage} />
        <BankRatesChart />
      </div>
    </div>
  )
}
