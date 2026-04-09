import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'JTN — Just The News',
    template: '%s | JTN',
  },
  description:
    'Neutral, AI-powered daily news aggregator. Top headlines from multiple sources, summarized and delivered without bias.',
  keywords: ['news', 'daily digest', 'unbiased news', 'news aggregator', 'AI news'],
  openGraph: {
    siteName: 'JTN — Just The News',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
