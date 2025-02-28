import Image from 'next/image'
import Link from 'next/link'
import { menu } from '@/lib/menu'

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Smart Financial Decisions for Canadians</h1>
              <p className="text-xl mb-8">
                Make confident financial choices with our data-driven tools and expert guidance. Start your journey to
                homeownership today.
              </p>
              <Link
                href={menu.realEstate.href}
                className="bg-white text-blue-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
              >
                Start House Hunting
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="flex justify-center items-center">
                <Image
                  src="/house-search.svg"
                  alt="Canadian Home"
                  width={400}
                  height={400}
                  className="w-[250px] h-[250px] md:w-[400px] md:h-[400px]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Make Better Financial Decisions</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <Link
              href={menu.mortgage.href}
              className="bg-card text-card-foreground p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <menu.mortgage.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{menu.mortgage.title}</h3>
              <p className="text-muted-foreground">{menu.mortgage.description}</p>
            </Link>
            <Link
              href={menu.buyVsRent.href}
              className="bg-card text-card-foreground p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <menu.buyVsRent.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{menu.buyVsRent.title}</h3>
              <p className="text-muted-foreground">{menu.buyVsRent.description}</p>
            </Link>
            <Link
              href={menu.properties.href}
              className="bg-card text-card-foreground p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <menu.properties.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{menu.properties.title}</h3>
              <p className="text-muted-foreground">
                Track and compare properties you&apos;re interested in. Get instant analysis and recommendations.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">More Features Coming Soon</h2>
          <p className="text-xl text-center text-muted-foreground mb-12">
            We&apos;re building tools to help you make better decisions about:
          </p>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {['Investments', 'Retirement Planning', 'Tax Optimization', 'Debt Management'].map((feature) => (
              <div key={feature} className="p-6 rounded-lg bg-muted">
                <p className="font-semibold text-lg">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Start Your Home Buying Journey Today</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of Canadians who are making smarter financial decisions with our tools and resources.
          </p>
          <Link
            href={menu.onboarding.href}
            className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </>
  )
}
