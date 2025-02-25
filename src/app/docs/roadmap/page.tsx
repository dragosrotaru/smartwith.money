'use client'

const statusColors = {
  'in-progress': 'bg-blue-500',
  planned: 'bg-green-500',
  considering: 'bg-yellow-500',
  researching: 'bg-purple-500',
}

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

const roadmapData = {
  'Q3 2023': [
    {
      title: 'AI-Powered Property Recommendations',
      description: 'Personalized property suggestions based on user preferences and behavior.',
      status: 'in-progress',
    },
    {
      title: 'Enhanced Mortgage Calculator',
      description: 'More detailed mortgage scenarios including land transfer tax and insurance estimates.',
      status: 'planned',
    },
    {
      title: 'Mobile App Beta',
      description: 'Limited release of our mobile app for iOS and Android.',
      status: 'planned',
    },
  ],
  'Q4 2023': [
    {
      title: 'Integration with Major Real Estate Platforms',
      description: 'Direct integration with popular listing sites for seamless property saving.',
      status: 'planned',
    },
    {
      title: 'Advanced Investment Analysis',
      description: 'Detailed ROI projections for potential investment properties.',
      status: 'planned',
    },
    {
      title: 'Community Forums',
      description: 'A place for users to discuss real estate trends and share advice.',
      status: 'considering',
    },
  ],
  'Q1 2024': [
    {
      title: 'Virtual Property Tours',
      description: 'Integration with VR technology for immersive property viewings.',
      status: 'considering',
    },
    {
      title: 'Predictive Market Analysis',
      description: 'AI-driven predictions for neighborhood property value trends.',
      status: 'planned',
    },
    {
      title: 'Expanded Reno Optimizer',
      description: 'More detailed renovation ROI calculations with local contractor integration.',
      status: 'planned',
    },
  ],
  'Q2 2024': [
    {
      title: 'Personal Finance Dashboard',
      description: 'Comprehensive view of your financial health beyond just real estate.',
      status: 'considering',
    },
    {
      title: 'International Markets',
      description: 'Expansion of our services to select international real estate markets.',
      status: 'considering',
    },
    {
      title: 'Smart Contract Integration',
      description: 'Blockchain-based smart contracts for secure and transparent transactions.',
      status: 'researching',
    },
  ],
} as const

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState('Q3 2023')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Smart With Money Roadmap</h1>
      <p className="text-xl mb-8">
        We&apos;re constantly working to improve and expand our platform. Here&apos;s a glimpse into what we&apos;re
        planning for the future:
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {Object.keys(roadmapData).map((quarter) => (
            <TabsTrigger key={quarter} value={quarter}>
              {quarter}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(roadmapData).map(([quarter, features]) => (
          <TabsContent key={quarter} value={quarter}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Have a suggestion?</h2>
        <p className="mb-4">
          We love hearing from our users! If you have an idea for a feature or improvement, please don&apos;t hesitate
          to reach out. Your feedback helps shape the future of Smart With Money.
        </p>
        <p>
          Contact us at{' '}
          <a href="mailto:feedback@smartwith.money" className="text-blue-600 hover:underline">
            feedback@smartwith.money
          </a>
        </p>
      </div>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  status,
}: {
  title: string
  description: string
  status: keyof typeof statusColors
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {title}
          <Badge className={`${statusColors[status]} text-white`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
