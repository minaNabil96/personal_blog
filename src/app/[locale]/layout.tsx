import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Navbar, Footer } from '@/components/layout'
import { createClient } from '@/lib/supabase/server'

const siteUrl = 'https://personalblog-phi-six.vercel.app'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: {
      template: `%s | Mina's tech`,
      default: "Mina's tech",
    },
    description: "Mina N. F.'s personal blog about programming, technology, and AI",
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      locale,
      url: siteUrl,
      siteName: "Mina's tech",
      title: "Mina's tech",
      description: "Mina N. F.'s personal blog about programming, technology, and AI",
      images: [
        {
          url: '/og-default.svg',
          width: 1200,
          height: 630,
          alt: "Mina's tech",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@minas_tech',
      creator: '@minas_tech',
      title: "Mina's tech",
      description: "Mina N. F.'s personal blog about programming, technology, and AI",
      images: ['/og-default.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <div dir={dir} className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
