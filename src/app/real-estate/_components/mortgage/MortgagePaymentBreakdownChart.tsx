'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mortgage } from '@/modules/real-estate/domain/mortgage'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

interface MortgagePaymentBreakdownChartProps {
  mortgage: Mortgage
}

interface DataPoint {
  year: number
  Principal: number
  Interest: number
}

export function MortgagePaymentBreakdownChart({ mortgage }: MortgagePaymentBreakdownChartProps) {
  // Calculate yearly payment breakdowns
  const yearlyData: DataPoint[] = Array.from({ length: mortgage.amortizationYears }, (_, yearIndex) => {
    const paymentsPerYear = mortgage.numberOfPaymentsPerYear
    // Take middle payment of each year for representative sample
    const paymentNumber = yearIndex * paymentsPerYear + Math.floor(paymentsPerYear / 2)
    let remainingBalance = mortgage.finalPrincipal

    // Calculate balance at this payment
    for (let i = 1; i < paymentNumber; i++) {
      const interest = remainingBalance * mortgage.paymentInterestRate
      remainingBalance -= mortgage.payment - interest
    }

    // Calculate the breakdown for this payment
    const interest = remainingBalance * mortgage.paymentInterestRate
    const principal = mortgage.payment - interest

    return {
      year: yearIndex + 1,
      Principal: Math.round(principal),
      Interest: Math.round(interest),
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Payment Breakdown Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tickFormatter={(value: number) => `Year ${value}`} tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value: number) => `$${value.toLocaleString()}`}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
                labelFormatter={(label: number) => `Year ${label}`}
                contentStyle={{ fontSize: '14px' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
              <Bar name="Principal" dataKey="Principal" stackId="payment" fill="#10b981" />
              <Bar name="Interest" dataKey="Interest" stackId="payment" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
