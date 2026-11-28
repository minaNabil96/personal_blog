import type { ReactNode } from 'react'
import { Navbar, Footer } from '@/components/layout'
import { hasAuthCookie } from '@/lib/supabase/server'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  // Cookie presence only: verifying the session here cost a Supabase round trip
  // on every page view, public pages included. The dashboard and every server
  // action verify the user for real.
  const isAuthenticated = await hasAuthCookie()

  return (
    <div dir={dir} className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
