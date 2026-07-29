import { getDictionary } from '@/lib/i18n/dictionaries'
import HeroSection from '@/components/home/HeroSection'
import FeaturedProjects from '@/components/home/FeaturedProjects'
import LatestArticles from '@/components/home/LatestArticles'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = 'https://personalblog-phi-six.vercel.app'
  
  return {
    title: "Mina's tech",
    description: "Mina N. F.'s personal blog about programming, technology, and AI",
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      locale,
      url: `${siteUrl}/${locale}`,
      siteName: "Mina's tech",
      title: "Mina's tech",
      description: "Mina N. F.'s personal blog about programming, technology, and AI",
      images: [
        {
          url: '/a_png_logo_for_tech_an.png',
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
      images: ['/a_png_logo_for_tech_an.png'],
    },
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  const { data: projectsRaw } = await supabase
    .from('posts')
    .select('id, slug, cover_image, created_at, post_translations(title, description, language), projects_meta(github_url, live_demo_url, tech_stack)')
    .eq('category', 'project')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: articlesRaw } = await supabase
    .from('posts')
    .select('id, slug, cover_image, created_at, post_translations(title, description, language)')
    .eq('category', 'technology')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(4)

  const projects = (projectsRaw || []).map((p) => {
    const t = p.post_translations?.find(pt => pt.language === locale) || p.post_translations?.[0]
    const techStack = (p.projects_meta as any)?.tech_stack || []
    return {
      id: p.id,
      title: t?.title || '',
      description: t?.description || '',
      slug: p.slug,
      cover_image: p.cover_image || '',
      tags: techStack,
      github_url: (p.projects_meta as any)?.github_url || '',
      live_url: (p.projects_meta as any)?.live_demo_url || '',
      created_at: p.created_at,
    }
  })

  const articles = (articlesRaw || []).map((a) => {
    const t = a.post_translations?.find(pt => pt.language === locale) || a.post_translations?.[0]
    return {
      id: a.id,
      title: t?.title || '',
      slug: a.slug,
      excerpt: t?.description || '',
      cover_image: a.cover_image || '',
      created_at: a.created_at,
    }
  })

  return (
    <>
      <HeroSection dictionary={dict} />
      <FeaturedProjects dictionary={dict} projects={projects} />
      <LatestArticles dictionary={dict} articles={articles} />
    </>
  )
}