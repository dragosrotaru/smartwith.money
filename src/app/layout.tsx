import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SessionProvider } from 'next-auth/react'
import { ActiveAccountProvider } from '@/contexts/ActiveAccountContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import { MobileNavigation } from '@/components/MobileNavigation'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { Toaster } from 'sonner'
import { InviteDialog } from '@/components/InviteDialog'
import { EnsureActiveAccount } from '@/components/EnsureActiveAccount'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Smart With Money',
  description: 'Your personal finance companion',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider>
        <ActiveAccountProvider>
          <SubscriptionProvider>
            <ThemeProvider>
              <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <SidebarProvider defaultOpen={false}>
                  <div className="flex flex-col min-h-screen w-full">
                    <EnsureActiveAccount />
                    <Header />
                    <main className="container mx-auto px-4 py-8 flex-grow">{children}</main>
                    <Footer />
                    <MobileNavigation />
                  </div>
                  <Toaster />
                  <InviteDialog />
                </SidebarProvider>
              </body>
            </ThemeProvider>
          </SubscriptionProvider>
        </ActiveAccountProvider>
      </SessionProvider>
    </html>
  )
}
