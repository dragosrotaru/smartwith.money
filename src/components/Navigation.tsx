'use client'

import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Mortgage Calculator',
    href: '/real-estate/mortgage-calculator',
    description: 'In depth calculator to help you understand your mortgage options and see how much you can afford.',
  },
  {
    title: 'Buy vs Rent',
    href: '/real-estate/buy-vs-rent',
    description: 'Compare the costs of buying vs renting in Canada.',
  },
  {
    title: 'House vs House',
    href: '/real-estate/house-vs-house',
    description: 'Compare two houses to see which one is a better investment.',
  },
  {
    title: 'Points of Interest',
    href: '/real-estate/points-of-interest',
    description: 'See how far each listing is from your work, school, friends, family, and more.',
  },
]

export default function Navigation() {
  return (
    <NavigationMenu className="[&_div.absolute]:-left-48 [&_div.absolute]:top-14">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Documentation</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">Smart With Money</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Helping Canadians navigate personal finance with confidence.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Getting Started">
                How to use our tools to buy a home (and beyond)
              </ListItem>
              <ListItem href="/docs/about" title="About Us">
                Learn about our technology, policies and team
              </ListItem>
              <ListItem href="/docs/roadmap" title="Roadmap">
                What you can expect from us in the future
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Real EstateTools</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem key={component.title} title={component.title} href={component.href}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/downloads" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Browser Extension</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = 'ListItem'
