import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentPosts } from '@/components/dashboard/RecentPosts'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  return {
    title: dict.dashboard.overview || 'Dashboard',
  }
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">{dict.dashboard.overview || 'Dashboard'}</h1>
        <p className="mt-1 text-zinc-400">{dict.dashboard.overviewDesc || 'Welcome to your admin dashboard'}</p>
      </div>

      <DashboardStats locale={locale} />
      <RecentPosts locale={locale} />
    </div>
  )
}