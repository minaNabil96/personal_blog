import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import BlogList from '@/components/blog/BlogList'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

const POSTS_PER_PAGE = 9

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { page } = await searchParams
  const currentPage = Number(page) || 1

  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'technology')
    .eq('published', true)

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)

  const { data: postsRaw } = await supabase
    .from('posts')
    .select('id, slug, cover_image, created_at, post_translations(title, description, language)')
    .eq('category', 'technology')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1)

  const posts = (postsRaw || []).map((p) => {
    const t = p.post_translations?.find(pt => pt.language === locale) || p.post_translations?.[0]
    return {
      id: p.id,
      title: t?.title || '',
      slug: p.slug,
      excerpt: t?.description || '',
      cover_image: p.cover_image || '',
      created_at: p.created_at,
      tags: [] as string[],
    }
  })

  return (
    <BlogList
      dictionary={dict}
      posts={posts}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  )
}