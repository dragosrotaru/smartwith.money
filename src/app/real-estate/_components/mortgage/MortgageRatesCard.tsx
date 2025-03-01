'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getMortgageRates, MortgageRate, MortgageRatesResponse } from '@/modules/real-estate/mortgageRates'
import Image from 'next/image'
import { formatPercent } from '@/lib/format'
import { useEffect, useState } from 'react'

interface MortgageRateRowProps {
  rate: MortgageRate
  provider: {
    name: string
    logo: string
  }
}

function MortgageRateRow({ rate, provider }: MortgageRateRowProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12">
          <Image src={provider.logo} alt={provider.name} fill className="object-contain" />
        </div>
        <div>
          <p className="font-medium">{provider.name}</p>
          <p className="text-sm text-muted-foreground">{rate.description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold">{formatPercent(rate.value)}</p>
        {rate.cashBack && <p className="text-sm text-green-600">Cashback: ${rate.cashBack}</p>}
      </div>
    </div>
  )
}

export function MortgageRatesCard() {
  const [mortgageRates, setMortgageRates] = useState<MortgageRatesResponse | null>(null)
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => {
    async function fetchMortgageRates() {
      const mortgageRates = await getMortgageRates({})
      if (mortgageRates instanceof Error) {
        setError(mortgageRates)
      } else {
        setMortgageRates(mortgageRates)
      }
    }
    fetchMortgageRates()
  }, [])

  // Sort rates by value (lowest first) for both fixed and variable
  const sortRates = (ratesList: MortgageRate[]) => {
    return [...ratesList].sort((a, b) => a.value - b.value)
  }

  // Get the best rates for each term
  const getBestRates = (rateType: 'fixed' | 'variable') => {
    return Object.entries(rates[rateType]).map(([term, termRates]) => ({
      term: parseInt(term),
      rates: sortRates(termRates).slice(0, 3), // Get top 3 rates
    }))
  }

  if (!mortgageRates) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardContent>
            <p className="text-red-500">Error fetching mortgage rates</p>
          </CardContent>
        </CardHeader>
      </Card>
    )
  }

  const { rates, providers, primeRate, qualifyingRate, lastUpdated } = mortgageRates.data

  const fixedRates = getBestRates('fixed')
  const variableRates = getBestRates('variable')

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Current Mortgage Rates</CardTitle>
        <CardDescription>
          Prime Rate: {formatPercent(primeRate)} | Qualifying Rate: {formatPercent(qualifyingRate)}
          <br />
          Last Updated: {new Date(lastUpdated).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fixed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fixed">Fixed Rates</TabsTrigger>
            <TabsTrigger value="variable">Variable Rates</TabsTrigger>
          </TabsList>
          <TabsContent value="fixed">
            <div className="space-y-6">
              {fixedRates.map(({ term, rates }) => (
                <div key={term}>
                  <h3 className="text-lg font-semibold mb-2">{term}-Month Fixed Term</h3>
                  <div className="rounded-lg border">
                    {rates.map((rate) => (
                      <MortgageRateRow key={rate.id} rate={rate} provider={providers[rate.provider]} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="variable">
            <div className="space-y-6">
              {variableRates.map(({ term, rates }) => (
                <div key={term}>
                  <h3 className="text-lg font-semibold mb-2">{term}-Month Variable Term</h3>
                  <div className="rounded-lg border">
                    {rates.map((rate) => (
                      <MortgageRateRow key={rate.id} rate={rate} provider={providers[rate.provider]} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
