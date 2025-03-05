'use client'

import { useState } from 'react'
import type { House } from '@/modules/real-estate/domain/house'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatPercent } from '@/lib/format'

interface HouseDisplayProps {
  house: House
}

export function HouseDisplay({ house }: HouseDisplayProps) {
  const [month, setMonth] = useState(0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>House Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="rental">Rental</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchase Price</Label>
                <div>{formatCurrency(house.mortgage.purchasePrice)}</div>
              </div>
              <div>
                <Label>Square Footage</Label>
                <div>{house.squareFootage} sq ft</div>
              </div>
              <div>
                <Label>Rented Square Footage</Label>
                <div>{house.rentedSquareFootage} sq ft</div>
              </div>
              <div>
                <Label>Rented Percentage</Label>
                <div>{formatPercent(house.rentedPercentage)}</div>
              </div>
              <div>
                <Label>Renovation Cost</Label>
                <div>{formatCurrency(house.rennovationCost)}</div>
              </div>
              <div>
                <Label>Renovation ROI</Label>
                <div>{formatPercent(house.rennovationROI)}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Annual Property Tax</Label>
                <div>{formatCurrency(house.annualPropertyTax.value)}</div>
              </div>
              <div>
                <Label>Annual Upkeep</Label>
                <div>{formatCurrency(house.annualUpkeep.value)}</div>
              </div>
              <div>
                <Label>Annual Insurance</Label>
                <div>{formatCurrency(house.annualInsurance.value)}</div>
              </div>
              <div>
                <Label>Annual Utilities</Label>
                <div>{formatCurrency(house.annualUtilities.value)}</div>
              </div>
              <div>
                <Label>Annual Appreciation Rate</Label>
                <div>{formatPercent(house.annualAppreciationRate)}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rental">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Annual Rent</Label>
                <div>{formatCurrency(house.annualRent.value)}</div>
              </div>
              <div>
                <Label>Annual Rent Vacancy Rate</Label>
                <div>{formatPercent(house.annualRentVacancyRate)}</div>
              </div>
              <div>
                <Label>Rent Income (Year 0)</Label>
                <div>{formatCurrency(house.rentIncomeAtYear(0))}</div>
              </div>
              <div>
                <Label>Rent Income (Month 1)</Label>
                <div>{formatCurrency(house.rentIncomePerMonthAtMonth(1))}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projections">
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectionMonth">Projection Month</Label>
                <Input
                  id="projectionMonth"
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>House Value</Label>
                  <div>{formatCurrency(house.valueAtMonth(month))}</div>
                </div>
                <div>
                  <Label>Equity</Label>
                  <div>{formatCurrency(house.equityAtMonth(month))}</div>
                </div>
                <div>
                  <Label>Cash Flow</Label>
                  <div>{formatCurrency(house.cashFlowPerMonthAtMonth(month))}</div>
                </div>
                <div>
                  <Label>Closing Costs</Label>
                  <div>{formatCurrency(house.closingCostsAtMonth(month))}</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
