import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import BlogList from '@/components/blog/BlogList'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; q?: string }>
}

const POSTS_PER_PAGE = 12

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = 'https://personalblog-phi-six.vercel.app'
  
  return {
    title: 'Blog',
    description: 'Latest articles about programming, technology, and AI',
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      locale,
      url: `${siteUrl}/${locale}/blog`,
      siteName: "Mina's tech",
      title: 'Blog | Mina&apos;s tech',
      description: 'Latest articles about programming, technology, and AI',
      images: [
        {
          url: '/og-landing.svg',
          width: 1200,
          height: 630,
          alt: 'Blog | Mina&apos;s tech',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@minas_tech',
      creator: '@minas_tech',
      title: 'Blog | Mina&apos;s tech',
      description: 'Latest articles about programming, technology, and AI',
      images: ['/og-landing.svg'],
    },
  }
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { page, q } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const search = (q || '').trim()

  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  let postIds: string[] | undefined
  if (search) {
    const { data: matching } = await supabase
      .from('post_translations')
      .select('post_id')
      .ilike('title', `%${search}%`)
    postIds = matching?.map(p => p.post_id) || []
    if (postIds.length === 0) {
      return (
        <BlogList
          dictionary={dict}
          posts={[]}
          currentPage={1}
          totalPages={0}
          search={search}
          locale={locale}
        />
      )
    }
  }

  let query = supabase
    .from('posts')
    .select('id, slug, cover_image, created_at, post_translations(title, description, language)', { count: 'exact' })
    .eq('published', true)

  if (postIds) {
    query = query.in('id', postIds)
  }

  const { data: postsRaw, count } = await query
    .order('created_at', { ascending: false })
    .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)

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
      search={search}
      locale={locale}
    />
  )
}
