import {
  Home,
  Calculator,
  Building2,
  MapPin,
  Wrench,
  Scale,
  LogIn,
  UserPlus,
  CreditCard,
  User,
  FileText,
  Map,
  Info,
  Puzzle,
  Shield,
  ScrollText,
  Mail,
  Twitter,
  Linkedin,
  Github,
  BookOpen,
  DollarSign,
  type LucideIcon,
} from 'lucide-react'

export type MenuItem = {
  title: string
  href: string
  description: string
  icon: LucideIcon
}

export type SocialLink = {
  title: string
  href: string
  icon: LucideIcon
}

export const socialLinks = {
  twitter: {
    title: 'Twitter',
    href: 'https://twitter.com/your-handle',
    icon: Twitter,
  },
  linkedin: {
    title: 'LinkedIn',
    href: 'https://linkedin.com/company/your-company',
    icon: Linkedin,
  },
  github: {
    title: 'GitHub',
    href: 'https://github.com/your-org',
    icon: Github,
  },
} as const

export const menu = {
  // User / Account
  signin: {
    title: 'Sign In',
    href: '/signin',
    description: 'Sign in to your account',
    icon: LogIn,
  },
  pricing: {
    title: 'Pricing',
    href: '/pricing',
    description: 'View our pricing plans and features',
    icon: DollarSign,
  },
  onboarding: {
    title: 'Onboarding',
    href: '/onboarding',
    description: 'Complete your account setup',
    icon: UserPlus,
  },
  account: {
    title: 'Account',
    href: '/account',
    description: 'Manage your account',
    icon: CreditCard,
  },
  user: {
    title: 'User Settings',
    href: '/user',
    description: 'Manage your user settings',
    icon: User,
  },
  // Documentation
  docs: {
    title: 'Documentation',
    href: '/docs',
    description: 'How to use our tools to buy a home (and beyond)',
    icon: FileText,
  },
  roadmap: {
    title: 'Roadmap',
    href: '/docs/roadmap',
    description: 'What you can expect from us in the future',
    icon: Map,
  },
  about: {
    title: 'About',
    href: '/docs/about',
    description: 'Learn about our technology, policies and team',
    icon: Info,
  },
  // Real Estate Tools
  realEstate: {
    title: 'Real Estate Tools',
    href: '/real-estate',
    description: 'Tools to help you buy, sell, and manage your real estate investments.',
    icon: Building2,
  },
  properties: {
    title: 'Saved Properties',
    href: '/real-estate/properties',
    description: 'Access your saved properties from across the web.',
    icon: Home,
  },
  mortgage: {
    title: 'Mortgage Calculator',
    href: '/real-estate/mortgage',
    description: 'In depth calculator to help you understand your mortgage options and see how much you can afford.',
    icon: Calculator,
  },
  buyVsRent: {
    title: 'Buy vs Rent',
    href: '/real-estate/buy-vs-rent',
    description: 'Compare the costs of buying vs renting in Canada.',
    icon: Scale,
  },
  compare: {
    title: 'House vs House',
    href: '/real-estate/compare',
    description: 'Compare two houses to see which one is a better investment.',
    icon: Scale,
  },
  renovations: {
    title: 'Reno / Flipper Optimizer',
    href: '/real-estate/renovations',
    description: 'Use AI to optimize your reno plans, maximize your ROI or plan your next flip.',
    icon: Wrench,
  },
  pointsOfInterest: {
    title: 'Points of Interest',
    href: '/real-estate/points-of-interest',
    description: 'See how far each listing is from your work, school, friends, family, and more.',
    icon: MapPin,
  },
  // Browser Extension
  extension: {
    title: 'Browser Extension',
    href: '/extension',
    description: 'Install our browser extension to easily save properties as you browse.',
    icon: Puzzle,
  },
  // Legal
  legal: {
    title: 'Legal',
    href: '/legal',
    description: 'Legal information and policies',
    icon: Shield,
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    href: '/legal/privacy-policy',
    description: 'Our privacy policy and data handling practices',
    icon: Shield,
  },
  termsOfService: {
    title: 'Terms of Service',
    href: '/legal/terms-of-service',
    description: 'Terms of service and user agreement',
    icon: ScrollText,
  },
  contact: {
    title: 'Contact',
    href: '/contact',
    description: 'Get in touch with our team',
    icon: Mail,
  },
  blog: {
    title: 'Blog',
    href: '/blog',
    description: 'Latest insights on Canadian real estate and personal finance',
    icon: BookOpen,
  },
} as const
