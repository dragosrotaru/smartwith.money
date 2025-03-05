import { Metadata } from 'next'
import { menu } from '@/lib/menu'
import Link from 'next/link'

export const metadata: Metadata = {
  title: menu.termsOfService.title + ' | Canadian Financial Tools',
  description: menu.termsOfService.description,
}

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-blue max-w-none">
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p>
            By accessing or using the services provided by Rotaru & Co Inc. (&quot;we&quot;, &quot;our&quot;, or
            &quot;us&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the
            terms, you may not access our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Description of Services</h2>
          <p className="mb-4">
            We provide financial tools and calculators designed to help Canadians make informed financial decisions,
            particularly in real estate and personal finance. Our services include:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Mortgage calculators and analysis</li>
            <li>Property comparison tools</li>
            <li>Buy vs. rent analysis</li>
            <li>Financial planning resources</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <p className="mb-4">
            When you create an account with us, you must provide accurate and complete information. You are responsible
            for maintaining the security of your account and for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p>
            The service and all materials therein, including software, images, text, graphics, illustrations, logos,
            patents, trademarks, service marks, copyrights, photographs, audio, videos, and music, are owned by or
            licensed to Rotaru & Co Inc. and are protected by intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
          <p className="mb-4">
            Our services are provided &quot;as is&quot; without any warranty. While we strive to provide accurate
            information and calculations:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>We do not guarantee the accuracy of our calculations or analysis</li>
            <li>Our tools should not be considered as financial advice</li>
            <li>Users should consult with qualified professionals for specific advice</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p>
            In no event shall Rotaru & Co Inc., its directors, employees, partners, agents, suppliers, or affiliates be
            liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of
            the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these terms at any time. We will provide notice of any significant
            changes. Your continued use of our services following such changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have questions about these Terms, please contact us at{' '}
            <Link href={`mailto:${process.env.SUPPORT_EMAIL}`} className="text-blue-600 hover:text-blue-800">
              {process.env.SUPPORT_EMAIL}
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
