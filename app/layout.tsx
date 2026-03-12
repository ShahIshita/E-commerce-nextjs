import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavbarWrapper from '@/components/NavbarWrapper'
import Footer from '@/components/Footer'
import { WishlistProvider } from '@/components/WishlistProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NexCart',
  description: 'Full-stack e-commerce application',
}

export default function RootLayout({
  
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WishlistProvider>
          <NavbarWrapper />
          <main>{children}</main>
          <Footer />
        </WishlistProvider>
      </body>
    </html>
  )
}
