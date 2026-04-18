import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-heading',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-numeric',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CostPilot AI — Financial Audit Engine',
  description: 'Paste any loan, credit card, or BNPL agreement. CostPilot AI extracts every term, calculates your real total cost, and flags every hidden charge — in seconds.',
  keywords: ['financial audit', 'loan calculator', 'hidden charges', 'fintech'],
  authors: [{ name: 'CostPilot AI' }],
  openGraph: {
    images: ['/linkLogo0.png']
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/linkLogo0.png']
  }
}

export const viewport: Viewport = {
  themeColor: '#0a0a12',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#0A0A12] scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0A0A12] text-[#E4E4E7]`}>
        {children}
      </body>
    </html>
  )
}
