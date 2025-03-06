'use client'
import * as React from 'react'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { menu, MenuItem } from '@/lib/menu'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import { SwitchAccountDialog } from '@/app/account/_components/SwitchAccountDialog'
import { ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const subMenuOne: MenuItem[] = [menu.docs, menu.about, menu.roadmap]
const subMenuTwo: MenuItem[] = [
  menu.properties,
  menu.mortgage,
  menu.buyVsRent,
  menu.compare,
  menu.pointsOfInterest,
  menu.renovations,
]

export function MobileNavigation() {
  const { data: session } = useSession()
  const { activeAccount } = useActiveAccount()

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>
              {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-medium">{session?.user?.name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
        {activeAccount && (
          <div className="mt-2 px-4 py-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" />
                <p className="text-xs font-medium text-muted-foreground">Active Account</p>
              </div>
              <SwitchAccountDialog
                trigger={
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
            <p className="text-sm font-medium pl-3.5 mt-1">{activeAccount.name}</p>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {subMenuOne.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Real Estate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {subMenuTwo.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={menu.blog.href}>
                    <menu.blog.icon />
                    <span>{menu.blog.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={menu.extension.href}>
                    <menu.extension.icon />
                    <span>{menu.extension.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={menu.pricing.href}>
                    <menu.pricing.icon />
                    <span>{menu.pricing.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
