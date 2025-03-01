'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CostCategory {
  title: string
  description: string
  items: {
    name: string
    description: string
    typicalCost: string
    timing: string
    notes?: string
  }[]
}

const costCategories: CostCategory[] = [
  {
    title: 'Legal and Administrative',
    description: 'Essential fees for handling the legal aspects of your property purchase.',
    items: [
      {
        name: 'Legal Fees',
        description: 'Professional fees for a real estate lawyer to handle the transaction.',
        typicalCost: '$1,500 - $2,500',
        timing: 'Due at closing',
        notes: 'Includes title search, document preparation, and closing representation.',
      },
      {
        name: 'Title Insurance',
        description: 'Insurance that protects against property title defects.',
        typicalCost: '$300 - $500',
        timing: 'Due at closing',
        notes: 'One-time premium that protects for the life of your ownership.',
      },
      {
        name: 'Property Survey',
        description: 'Professional survey of the property boundaries.',
        typicalCost: '$1,000 - $2,000',
        timing: 'Before closing',
        notes: 'May be required by lender or for title insurance.',
      },
    ],
  },
  {
    title: 'Property Assessment',
    description: 'Costs related to evaluating the property condition and value.',
    items: [
      {
        name: 'Home Inspection',
        description: 'Detailed inspection of the property condition.',
        typicalCost: '$400 - $600',
        timing: 'Before purchase agreement',
        notes: 'Highly recommended for all property purchases.',
      },
      {
        name: 'Appraisal Fee',
        description: 'Professional assessment of property value.',
        typicalCost: '$300 - $500',
        timing: 'During mortgage approval',
        notes: 'Usually required by the mortgage lender.',
      },
    ],
  },
  {
    title: 'Government Fees',
    description: 'Mandatory fees and taxes paid to various government bodies.',
    items: [
      {
        name: 'Land Transfer Tax',
        description: 'Provincial tax on property purchases.',
        typicalCost: 'Varies by purchase price and location',
        timing: 'Due at closing',
        notes: 'First-time buyers may be eligible for rebates.',
      },
      {
        name: 'Property Tax Adjustment',
        description: 'Reimbursement to seller for prepaid property taxes.',
        typicalCost: 'Varies by property and timing',
        timing: 'Due at closing',
        notes: 'Prorated based on closing date.',
      },
    ],
  },
  {
    title: 'Insurance and Mortgage',
    description: 'Insurance requirements and mortgage-related costs.',
    items: [
      {
        name: 'Mortgage Insurance (CMHC)',
        description: 'Required for down payments less than 20%.',
        typicalCost: '2.8% - 4% of mortgage amount',
        timing: 'Added to mortgage',
        notes: 'Can be paid upfront or added to mortgage principal.',
      },
      {
        name: 'Home Insurance',
        description: 'Property insurance required by lenders.',
        typicalCost: '$800 - $1,200 annually',
        timing: 'First year due at closing',
        notes: 'Must be arranged before closing.',
      },
    ],
  },
]

export default function ClosingCostsGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Closing Costs Guide</h1>
        <p className="text-muted-foreground mb-8">
          Understanding all the costs involved in purchasing a property is crucial for proper financial planning. This
          guide breaks down the typical closing costs you can expect when buying a property in Canada.
        </p>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {costCategories.map((category) => (
              <TabsTrigger key={category.title} value={category.title}>
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Closing Costs Overview</CardTitle>
                <CardDescription>
                  A summary of all potential costs you may encounter when closing on a property.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {costCategories.map((category) => (
                    <div key={category.title} className="space-y-2">
                      <h3 className="text-lg font-semibold">{category.title}</h3>
                      <p className="text-muted-foreground">{category.description}</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {category.items.map((item) => (
                          <li key={item.name}>
                            <span className="font-medium">{item.name}</span> - Typically {item.typicalCost}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {costCategories.map((category) => (
            <TabsContent key={category.title} value={category.title}>
              <Card>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {category.items.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <div className="text-right">
                            <p className="font-medium">{item.typicalCost}</p>
                            <p className="text-sm text-muted-foreground">{item.timing}</p>
                          </div>
                        </div>
                        <p>{item.description}</p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Note:</span> {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
