import { Metadata } from 'next'
import { menu } from '@/lib/menu'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing | Canadian Financial Tools',
  description: 'Choose the plan that works best for you',
}

const tiers = [
  {
    name: 'No Account',
    price: 'Free',
    description: 'Basic access to essential tools',
    features: ['Access to basic tools', 'Property search', 'Basic mortgage calculator'],
    href: '/',
    buttonText: 'Get Started',
  },
  {
    name: 'Free Account',
    price: 'Free',
    description: 'Enhanced features with a free account',
    features: [
      'Save properties',
      'Points of interest tracking',
      'Rate-limited access to AI tools',
      'Browser extension access',
    ],
    href: '/signin',
    buttonText: 'Sign Up',
  },
  {
    name: 'Pro',
    price: '$10',
    period: '/month',
    description: 'Full access to all premium features',
    features: [
      'Unlimited access to AI tools',
      'Advanced accounting tools',
      'Priority support',
      'All Free Account features',
    ],
    href: '/signin?plan=pro',
    buttonText: 'Get Pro',
    featured: true,
  },
]

export default function PricingPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">Choose the plan that works best for you</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <Card key={tier.name} className={tier.featured ? 'border-primary shadow-lg relative' : ''}>
            {tier.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription className="text-lg">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{tier.description}</p>
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant={tier.featured ? 'default' : 'outline'}>
                <Link href={tier.href}>{tier.buttonText}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
