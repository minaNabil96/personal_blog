import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Navbar, Footer } from '@/components/layout'
import { createClient } from '@/lib/supabase/server'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: {
      template: `%s | Personal Blog (${locale})`,
      default: 'Personal Blog',
    },
    description: 'A personal blog about web development and design',
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
