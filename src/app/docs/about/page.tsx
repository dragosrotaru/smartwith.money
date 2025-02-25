import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Canadian Financial Tools',
  description:
    'Learn about our mission to help Canadians make better financial decisions through data-driven tools and expert guidance.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">About Us</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Our Mission</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We&apos;re dedicated to empowering Canadians to make smarter financial decisions through innovative,
          data-driven tools and comprehensive guidance. Our platform focuses on simplifying complex financial decisions,
          particularly in real estate and personal finance management.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Our Tools</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">Real Estate Tools</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Mortgage Calculator and Analysis</li>
              <li>Buy vs. Rent Comparison Tool</li>
              <li>Property Tracking and Comparison</li>
              <li>Renovation ROI Calculator</li>
              <li>Points of Interest Analysis</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">Coming Soon</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Investment Portfolio Optimization</li>
              <li>Retirement Planning Calculator</li>
              <li>Tax Strategy Tools</li>
              <li>Debt Management Solutions</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Why Choose Us</h2>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">Our platform stands out through its:</p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>Canadian-specific financial tools and calculations</li>
            <li>Data-driven approach to decision making</li>
            <li>User-friendly interface and comprehensive guidance</li>
            <li>Regular updates to reflect market changes</li>
            <li>Focus on long-term financial success</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Get Started</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Whether you&apos;re planning to buy your first home, comparing investment options, or mapping out your
          financial future, our tools are designed to help you make informed decisions. Create a free account today to
          access our full suite of financial planning tools.
        </p>
      </section>
    </div>
  )
}
