'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getBankRates, BankRate } from '@/modules/actions'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export function BankRatesChart() {
  const [rates, setRates] = useState<BankRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getBankRates()
        setRates(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch bank rates')
        console.error('BankRatesChart error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank of Canada Interest Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-[400px] bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank of Canada Interest Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (rates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank of Canada Interest Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-gray-500">No data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank of Canada Interest Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rates} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                type="number"
                domain={['auto', 'auto']}
                tickFormatter={(value) => format(value, 'MMM yyyy')}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(2)}%`}
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                width={60}
              />
              <Tooltip
                labelFormatter={(value) => format(value, 'MMMM d, yyyy')}
                formatter={(value: number, name: string) => {
                  const labels = {
                    primeRate: 'Prime Rate',
                    bankRate: 'Bank Rate',
                    overnightTarget: 'Overnight Target',
                  }
                  return [`${value.toFixed(2)}%`, labels[name as keyof typeof labels]]
                }}
                contentStyle={{ fontSize: '14px' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
              <Line
                type="stepAfter"
                name="primeRate"
                dataKey="primeRate"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                name="bankRate"
                dataKey="bankRate"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                name="overnightTarget"
                dataKey="overnightTarget"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
