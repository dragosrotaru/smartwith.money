import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { SessionProvider } from 'next-auth/react'
import { ActiveAccountProvider } from '@/contexts/ActiveAccountContext'

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
    <html lang="en">
      <SessionProvider>
        <ActiveAccountProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col  bg-gray-50`}
          >
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </body>
        </ActiveAccountProvider>
      </SessionProvider>
    </html>
  )
}
