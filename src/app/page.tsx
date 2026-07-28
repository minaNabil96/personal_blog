import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const SUPPORTED_LOCALES = ['ar', 'en', 'ru'] as const
const DEFAULT_LOCALE = 'ar'

export default async function Home() {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language') || ''
  
  const preferred = acceptLanguage
    .split(',')
    .map((l) => l.split(';')[0].trim().split('-')[0])
    .find((l) => SUPPORTED_LOCALES.includes(l as any))
  
  const locale = preferred || DEFAULT_LOCALE
  redirect(`/${locale}`)
}