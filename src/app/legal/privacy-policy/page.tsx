import { Metadata } from 'next'
import { menu } from '@/lib/menu'

export const metadata: Metadata = {
  title: menu.privacyPolicy.title + ' | Canadian Financial Tools',
  description: menu.privacyPolicy.description,
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-blue max-w-none">
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            Rotaru & Co Inc. (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
            use our financial tools and services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Personal identification information (name, email address)</li>
            <li>Financial information for analysis and calculations</li>
            <li>Property and real estate information</li>
            <li>Account preferences and settings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Provide and maintain our services</li>
            <li>Personalize your experience</li>
            <li>Process your calculations and analysis</li>
            <li>Send you important updates and notifications</li>
            <li>Improve our services and develop new features</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your information.
            However, no electronic transmission or storage system is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our practices, please contact us at{' '}
            <a href="mailto:privacy@example.com" className="text-blue-600 hover:text-blue-800">
              privacy@example.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
