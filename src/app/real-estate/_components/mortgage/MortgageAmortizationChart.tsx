'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mortgage } from '@/modules/real-estate/domain/mortgage'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

interface MortgageAmortizationChartProps {
  mortgage: Mortgage
}

interface DataPoint {
  year: number
  'Principal Paid': number
  'Interest Paid': number
  'Remaining Balance': number
}

export function MortgageAmortizationChart({ mortgage }: MortgageAmortizationChartProps) {
  // Calculate yearly data points
  const yearlyData: DataPoint[] = Array.from({ length: mortgage.amortizationYears }, (_, yearIndex) => {
    const paymentsPerYear = mortgage.numberOfPaymentsPerYear
    const startPayment = yearIndex * paymentsPerYear
    const endPayment = startPayment + paymentsPerYear

    // Calculate cumulative principal and interest for this year
    let cumulativePrincipal = 0
    let cumulativeInterest = 0
    let remainingBalance = mortgage.finalPrincipal

    // Sum up all payments up to this year
    for (let payment = 1; payment <= endPayment && payment <= mortgage.numberOfPayments; payment++) {
      const interest = remainingBalance * mortgage.paymentInterestRate
      const principal = mortgage.payment - interest

      cumulativeInterest += interest
      cumulativePrincipal += principal
      remainingBalance -= principal
    }

    return {
      year: yearIndex + 1,
      'Principal Paid': Math.round(cumulativePrincipal),
      'Interest Paid': Math.round(cumulativeInterest),
      'Remaining Balance': Math.max(0, Math.round(remainingBalance)),
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amortization Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tickFormatter={(value: number) => `Year ${value}`} tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}K`}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
                labelFormatter={(label: number) => `Year ${label}`}
                contentStyle={{ fontSize: '14px' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
              <Line
                type="monotone"
                name="Principal Paid"
                dataKey="Principal Paid"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                name="Interest Paid"
                dataKey="Interest Paid"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                name="Remaining Balance"
                dataKey="Remaining Balance"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
