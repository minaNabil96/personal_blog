import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import '@fontsource/tajawal/400.css'
import '@fontsource/tajawal/700.css'
import './globals.css'
import Providers from '@/components/providers'

const siteUrl = 'https://personalblog-phi-six.vercel.app'
const defaultOgImage = `${siteUrl}/og-default.png`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | Mina's tech`,
    default: "Mina's tech",
  },
  description: "Mina N. F.'s personal blog about programming, technology, and AI",
  openGraph: {
    type: 'website',
    siteName: "Mina's tech",
    title: "Mina's tech",
    description: "Mina N. F.'s personal blog about programming, technology, and AI",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Mina's tech",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mina's tech",
    description: "Mina N. F.'s personal blog about programming, technology, and AI",
    images: [defaultOgImage],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/a_png_logo_for_tech_an.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen font-['Tajawal',sans-serif]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
