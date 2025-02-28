import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Chrome, ChromeIcon as Firefox, Home, BarChart, Lock, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function ExtensionInfoPage() {
  return (
    <div>
      <HeroSection />
      <KeyFeatures />
      <HowItWorks />
      <SupportedWebsites />
      <Benefits />
      <DownloadInstructions />
      <FAQSection />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="text-center py-12">
      <h1 className="text-4xl font-bold mb-4">Smart House Hunting Extension</h1>
      <p className="text-xl mb-8">Track, save, and analyze your dream homes with ease.</p>
      <div className="flex justify-center space-x-4">
        <Button className="flex items-center">
          <Chrome className="mr-2" />
          Download for Chrome
        </Button>
        <Button className="flex items-center" variant="outline">
          <Firefox className="mr-2" />
          Download for Firefox
        </Button>
      </div>
    </section>
  )
}

function KeyFeatures() {
  const features = [
    {
      icon: <Home className="h-8 w-8 mb-2" />,
      title: 'Automatic Tracking',
      description: 'Seamlessly track houses you like across the web and share them with your partner or agent ',
    },
    {
      icon: <BarChart className="h-8 w-8 mb-2" />,
      title: 'Deep Analysis',
      description:
        'Get in-depth analysis on all your favourite homes based on your own criteria. Use AI tools to help you.',
    },
    {
      icon: <Lock className="h-8 w-8 mb-2" />,
      title: 'Your Data, Your Choice',
      description: 'Export your data to JSON or CSV format at any time to use with other tools',
    },
  ]

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <CardTitle className="flex justify-center items-center">{feature.icon}</CardTitle>
            </CardHeader>
            <CardContent className="max-w-xs mx-auto">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p>{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    'Install the extension',
    'Browse houses on HouseSigma or Realtor.ca',
    'The extension automatically saves favourited properties',
    'Access your favourite properties on your smartwith.money account',
    'Perform deep analysis and comparisons that goes well beyond the data provided by the website',
    'Share your favourite homes with your partner, friends, family or agent',
  ]

  return (
    <section className="p-12 bg-muted/50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={index} className="flex items-center">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function SupportedWebsites() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Supported Websites</h2>
      <div className="flex justify-center space-x-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">HouseSigma</CardTitle>
          </CardHeader>
          <CardContent>
            <Image src="/house-sigma.png" width={512} height={512} alt="HouseSigma logo" className="mx-auto" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Realtor.ca</CardTitle>
          </CardHeader>
          <CardContent>
            <Image src="/realtor-ca.png" width={512} height={512} alt="Realtor.ca logo" className="mx-auto" />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function Benefits() {
  const benefits = [
    'Save time by automatically tracking viewed properties',
    'Never lose track of a potential dream home',
    'Compare properties side-by-side with detailed analytics',
    'Make informed decisions with comprehensive property data',
    'Streamline your house hunting process',
  ]

  return (
    <section className="p-12 bg-muted/50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Benefits of Using Our Extension</h2>
        <ul className="space-y-4">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="text-primary mr-4" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function DownloadInstructions() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Download and Installation</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Chrome className="mr-2" /> Chrome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the &quot;Download for Chrome&quot; button below</li>
              <li>Click &quot;Add to Chrome&quot; in the Chrome Web Store</li>
              <li>Confirm the installation when prompted</li>
              <li>The extension icon will appear in your browser toolbar</li>
            </ol>
            <div className="flex justify-center my-8">
              <Button className="flex items-center">
                <Chrome className="mr-2" />
                Download for Chrome
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Firefox className="mr-2" /> Firefox
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the &quot;Download for Firefox&quot; button below</li>
              <li>Click &quot;Add to Firefox&quot; on the Firefox Add-ons page</li>
              <li>Click &quot;Add&quot; when prompted to confirm</li>
              <li>The extension icon will appear in your browser toolbar</li>
            </ol>
            <div className="flex justify-center my-8">
              <Button className="flex items-center" variant="outline">
                <Firefox className="mr-2" />
                Download for Firefox
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function FAQSection() {
  const faqs = [
    {
      question: 'Is the extension free to use?',
      answer:
        'Yes, the extension and website is free to use for all smartwith.money account holders. There are some paid-for features',
    },
    {
      question: 'How secure is this?',
      answer:
        'We take data security seriously. All your data is encrypted and private. You can export your data to JSON or CSV format at any time to use with other tools. We do not sell your data to third parties, and our extension code is open source, meaning you can audit it yourself.',
    },
    {
      question: 'Can I use the extension on multiple devices?',
      answer:
        'Yes, you can install and use the extension on multiple devices. Your data will be synced across all devices and stored in your smartwith.money account.',
    },
    {
      question: 'What if I encounter issues with the extension?',
      answer: `If you experience any issues, please contact our support team: ${process.env.SUPPORT_EMAIL}`,
    },
  ]

  return (
    <section className="p-12 mb-20 bg-muted/50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
