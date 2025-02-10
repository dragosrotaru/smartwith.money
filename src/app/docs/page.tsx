import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { menu, MenuItem } from '@/lib/menu'

export default function GettingStartedPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Getting Started with Smart With Money</h1>
      <p className="text-xl mb-8">
        Welcome to Smart With Money! We&apos;re here to help you navigate the complex world of personal finance, with a
        focus on making your home-buying journey smoother and more informed. Here&apos;s how to get started:
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="1. Create Your Account"
          description="Sign up and complete your profile to unlock personalized recommendations and save your progress."
        />
        <FeatureCard
          title="2. Explore Real Estate Tools"
          description="Use our suite of tools to analyze properties, calculate mortgages, and compare options."
          link={menu.realEstate}
        />
        <FeatureCard
          title="3. Save Properties"
          description="As you browse listings across the web, save properties to your account for easy comparison."
          link={menu.properties}
        />
        <FeatureCard
          title="4. Analyze Your Options"
          description="Compare properties, understand the buy vs. rent trade-offs, and optimize your decision."
          link={menu.compare}
        />
        <FeatureCard
          title="5. Plan Your Finances"
          description="Use our mortgage calculator and affordability tools to plan your finances."
          link={menu.mortgage}
        />
        <FeatureCard
          title="6. Optimize Your Investment"
          description="Whether you're buying to live or invest, use our tools to maximize your return on investment."
          link={menu.renovations}
        />
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">Once you&apos;ve familiarized yourself with our tools, don&apos;t forget to:</p>
        <ul className="list-disc list-inside mb-6">
          <li>
            Install our{' '}
            <Link href={menu.extension.href} className="text-blue-600 hover:underline">
              browser extension
            </Link>{' '}
            to easily save properties as you browse
          </li>
          <li>
            Check out our{' '}
            <Link href={menu.roadmap.href} className="text-blue-600 hover:underline">
              roadmap
            </Link>{' '}
            to see upcoming features
          </li>
          <li>
            Learn more{' '}
            <Link href={menu.about.href} className="text-blue-600 hover:underline">
              about us
            </Link>{' '}
            and our mission
          </li>
        </ul>
        <p>
          If you have any questions or need assistance, don&apos;t hesitate to reach out to our support team. We&apos;re
          here to help you make smart decisions with your money!
        </p>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, link }: { title: string; description: string; link?: MenuItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{description}</CardDescription>
        {link && (
          <Button asChild>
            <Link href={link.href}>{link.title}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
