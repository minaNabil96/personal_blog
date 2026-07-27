import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import ProjectsGrid from '@/components/projects/ProjectsGrid'

type Props = {
  params: Promise<{ locale: string }>
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