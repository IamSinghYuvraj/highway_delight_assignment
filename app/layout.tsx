import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import ClientAnalytics from "@/components/ClientAnalytics"
import './globals.css'

export const metadata: Metadata = {
  title: 'Highway Delight',
  description: 'Assignment for Highway Delight',
  generator: 'Assignment for Highway Delight',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        {/* Move Analytics to client component to avoid hydration errors */}
        {typeof window !== "undefined" && <ClientAnalytics />}
      </body>
    </html>
  )
}
