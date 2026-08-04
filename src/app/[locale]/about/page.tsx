import { getDictionary } from '@/lib/i18n/dictionaries'
import AboutSection from '@/components/about/AboutSection'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = 'https://personalblog-phi-six.vercel.app'
  const ogImageUrl = `${siteUrl}/og-default.png`

  return {
    title: 'About',
    description: "Mina Hanna's biography, experience, and skills",
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      locale,
      url: `${siteUrl}/${locale}/about`,
      siteName: "Mina's tech",
      title: 'About | Mina&apos;s tech',
      description: "Mina Hanna's biography, experience, and skills",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'About | Mina&apos;s tech',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@minas_tech',
      creator: '@minas_tech',
      title: 'About | Mina&apos;s tech',
      description: "Mina Hanna's biography, experience, and skills",
      images: [ogImageUrl],
    },
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  return <AboutSection dictionary={dict} />
}