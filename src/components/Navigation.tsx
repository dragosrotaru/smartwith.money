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
import Logo from './Logo'
import { menu, MenuItem } from '@/lib/menu'

const subMenuOne: MenuItem[] = [menu.docs, menu.about, menu.roadmap]

const subMenuTwo: MenuItem[] = [
  menu.properties,
  menu.mortgage,
  menu.buyVsRent,
  menu.compare,
  menu.pointsOfInterest,
  menu.renovations,
]

export default function Navigation() {
  return (
    <NavigationMenu className="hidden md:flex [&_div.absolute]:-left-48 [&_div.absolute]:top-12">
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
                    <Logo />
                    <div className="mb-2 mt-4 text-lg font-medium">Smart With Money</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Helping Canadians navigate personal finance with confidence.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>

              {subMenuOne.map((item) => (
                <ListItem key={item.title} href={item.href} title={item.title}>
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link href={menu.realEstate.href}>{menu.realEstate.title}</Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {subMenuTwo.map((component) => (
                <ListItem key={component.title} title={component.title} href={component.href}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href={menu.blog.href} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Blog</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href={menu.extension.href} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Browser Extension</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href={menu.pricing.href} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Pricing</NavigationMenuLink>
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
