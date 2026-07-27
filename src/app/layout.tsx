import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import '@fontsource/tajawal/400.css'
import '@fontsource/tajawal/700.css'
import './globals.css'
import Providers from '@/components/providers'

export const metadata: Metadata = {
  title: 'Personal Blog',
  description: 'A personal blog about web development and design',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-['Tajawal',sans-serif]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
