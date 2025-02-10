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
  Users,
  User,
  FileText,
  Map,
  Info,
  Puzzle,
  type LucideIcon,
} from 'lucide-react'

export type MenuItem = {
  title: string
  href: string
  description: string
  icon: LucideIcon
}

export const menu = {
  // User / Account
  login: {
    title: 'Login',
    href: '/login',
    description: 'Login to your account',
    icon: LogIn,
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
  billing: {
    title: 'Billing',
    href: '/account/billing',
    description: 'Manage your billing',
    icon: CreditCard,
  },
  referral: {
    title: 'Referral',
    href: '/referral',
    description: 'Refer friends and earn rewards',
    icon: Users,
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
} as const
