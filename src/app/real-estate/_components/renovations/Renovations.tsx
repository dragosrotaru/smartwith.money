'use client'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { type Renovation as Reno } from '@/modules/real-estate/photo'
import { loadOrGenPhoto } from '@/modules/real-estate/photo/repo'
import { HouseSigma } from '@/modules/real-estate/housesigma/schema'
import * as React from 'react'
import { BrainIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { maximizeROI } from '@/modules/real-estate/renovation'
import { RenovationTable } from './RenovationsTable'

type Renovation = Reno & {
  type: string
}

export function RenovationRecommendations({ property }: { property: HouseSigma }) {
  const [budget, setBudget] = useState<number>(10000)
  const [timeBudget, setTimeBudget] = useState<number>(100)
  const [renovations, setRenovations] = useState<Renovation[]>([])
  const [selectedRenovations, setSelectedRenovations] = useState<Renovation[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // calculate selected renovations budget, roi, time
  const selectedSums = useMemo(() => {
    return selectedRenovations.reduce(
      (acc, reno) => {
        acc.materialCost += reno.materialCost
        acc.roi += reno.roi
        acc.time += reno.diyTime
        return acc
      },
      { materialCost: 0, roi: 0, time: 0 },
    )
  }, [selectedRenovations])

  const handleGenerateRenovations = async () => {
    setLoading(true)
    try {
      const photoAnalysis = await loadOrGenPhoto(property.basicInfo.id, true, property.photos)
      Object.entries(photoAnalysis.renovations).forEach(([type, reno]) => {
        setRenovations((prev) => [...prev, ...reno.map((r) => ({ ...r, type }))])
      })
    } catch (error) {
      console.error('Error generating renovations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMaximizeROI = () => {
    const renovationsByType = renovations.reduce(
      (acc, reno) => {
        acc[reno.type] = [...(acc[reno.type] || []), reno]
        return acc
      },
      {} as Record<string, Renovation[]>,
    )
    const result = maximizeROI(timeBudget, budget, renovationsByType)
    // set selected renovations to the result
    setSelectedRenovations(result.selected as Renovation[])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Renovation Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row space-x-4 justify-between">
          <div className="flex flex-row space-x-2">
            <div>
              <Label htmlFor="budget">Renovation Budget ($)</Label>
              <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="timeBudget">Time Budget (hours)</Label>
              <Input
                id="timeBudget"
                type="number"
                value={timeBudget}
                onChange={(e) => setTimeBudget(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-row space-x-2">
            <div>
              <Label htmlFor="selectedRenovationsBudget font-bold">Material Cost ($)</Label>
              <div className="font-bold">
                {Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' }).format(selectedSums.materialCost)}
              </div>
            </div>
            <div>
              <Label htmlFor="selectedRenovationsTime font-bold">DIY Time (hours)</Label>
              <div className="font-bold">{selectedSums.time}</div>
            </div>
            <div>
              <Label htmlFor="selectedRenovationsROI font-bold">Total ROI (%)</Label>
              <div className="font-bold">{selectedSums.roi}</div>
            </div>
          </div>
          <div className="flex flex-row space-x-2">
            <Button onClick={handleGenerateRenovations} disabled={loading}>
              <BrainIcon className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Generate'}
            </Button>
            <Button onClick={handleMaximizeROI} disabled={renovations.length === 0}>
              <BrainIcon className="w-4 h-4 mr-2" />
              Maximize ROI
            </Button>
          </div>
        </div>
        <RenovationTable
          renovations={renovations}
          selectedRenovations={selectedRenovations}
          onSelected={setSelectedRenovations}
        />
      </CardContent>
    </Card>
  )
}
