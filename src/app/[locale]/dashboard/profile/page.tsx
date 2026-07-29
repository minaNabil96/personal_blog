import type { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getProfile } from '@/actions/profile'
import { ProfileForm } from '@/components/dashboard/ProfileForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  return { title: dict.dashboard?.profile || 'Profile' }
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const profile = await getProfile()

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">{dict.dashboard?.profile || 'Profile'}</h1>
        <p className="mt-1 text-zinc-400">Manage your profile and avatar</p>
      </div>
      <ProfileForm locale={locale} profile={profile} />
    </div>
  )
}
