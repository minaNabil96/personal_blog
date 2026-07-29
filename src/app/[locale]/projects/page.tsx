import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import ProjectsGrid from '@/components/projects/ProjectsGrid'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = 'https://personalblog-phi-six.vercel.app'
  
  return {
    title: 'Projects',
    description: 'A collection of my projects and open-source work',
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      locale,
      url: `${siteUrl}/${locale}/projects`,
      siteName: "Mina's tech",
      title: 'Projects | Mina&apos;s tech',
      description: 'A collection of my projects and open-source work',
      images: [
        {
          url: '/og-landing.svg',
          width: 1200,
          height: 630,
          alt: 'Projects | Mina&apos;s tech',
        },
      ],
    },
twitter: {
      card: 'summary_large_image',
      site: '@minas_tech',
      creator: '@minas_tech',
      title: 'Projects | Mina&apos;s tech',
      description: 'A collection of my projects and open-source work',
      images: ['/og-landing.svg'],
    },
  }
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  const { data: projectsRaw } = await supabase
    .from('posts')
    .select('id, slug, cover_image, created_at, post_translations(title, description, language), projects_meta(github_url, live_demo_url, tech_stack)')
    .eq('category', 'project')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const projects = (projectsRaw || []).map((p) => {
    const t = p.post_translations?.find(pt => pt.language === locale) || p.post_translations?.[0]
    const techStack = (p.projects_meta as any)?.tech_stack || []
    return {
      id: p.id,
      title: t?.title || '',
      description: t?.description || '',
      slug: p.slug,
      cover_image: p.cover_image || '',
      tech_stack: techStack,
      tags: techStack,
      github_url: (p.projects_meta as any)?.github_url || '',
      live_url: (p.projects_meta as any)?.live_demo_url || '',
      created_at: p.created_at,
    }
  })

  return (
    <ProjectsGrid
      dictionary={dict}
      projects={projects}
    />
  )
}