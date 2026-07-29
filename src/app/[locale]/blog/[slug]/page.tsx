import { notFound } from 'next/navigation'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import { getLoveData } from '@/actions/loves'
import ArticleDetail from '@/components/blog/ArticleDetail'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('id, slug, cover_image, category, published, created_at, author_id, authors(username, avatar_url), post_translations(language, title, description, content)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) return { title: 'Not Found' }

  const translation = post.post_translations?.find(t => t.language === locale) || post.post_translations?.[0]
  const authorData = post.authors as { username?: string; avatar_url?: string | null } | null

  const siteUrl = 'https://personalblog-phi-six.vercel.app'
  const articleUrl = `${siteUrl}/${locale}/blog/${slug}`
  const ogImage = post.cover_image || '/og-landing.svg'

  return {
    title: translation?.title || 'Article',
    description: translation?.description || "Mina N. F.'s personal blog about programming, technology, and AI",
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'article',
      locale,
      url: articleUrl,
      siteName: "Mina's tech",
      title: translation?.title || 'Article',
      description: translation?.description || "Mina N. F.'s personal blog",
      publishedTime: post.created_at,
      authors: authorData?.username || 'Mina N. F.',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: translation?.title || 'Article',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@minas_tech',
      creator: '@minas_tech',
      title: translation?.title || 'Article',
      description: translation?.description || "Mina N. F.'s personal blog",
      images: [ogImage],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('id, slug, cover_image, category, published, created_at, author_id, authors(username, avatar_url), post_translations(language, title, description, content)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const { data: relatedRaw } = await supabase
    .from('posts')
    .select('id, slug, cover_image, created_at, post_translations(title, description, language)')
    .eq('category', 'technology')
    .eq('published', true)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(2)

  const relatedPosts = (relatedRaw || []).map((p) => {
    const t = p.post_translations?.find(pt => pt.language === locale) || p.post_translations?.[0]
    return {
      id: p.id,
      title: t?.title || '',
      slug: p.slug,
      excerpt: t?.description || '',
      cover_image: p.cover_image || '',
      created_at: p.created_at,
    }
  })

  const translation = post.post_translations?.find(t => t.language === locale) || post.post_translations?.[0]

  const authorData = post.authors as { username?: string; avatar_url?: string | null } | null
  const article = {
    id: post.id,
    title: translation?.title || '',
    slug: post.slug,
    content: typeof translation?.content === 'string' ? translation.content : '',
    excerpt: translation?.description || '',
    cover_image: post.cover_image || '',
    created_at: post.created_at,
    author: authorData?.username || 'Mina N. F.',
    author_avatar: authorData?.avatar_url || null,
    tags: [] as string[],
  }

  // Fetch love data
  const loveData = await getLoveData(post.id)

  return (
    <ArticleDetail
      dictionary={dict}
      post={article}
      relatedPosts={relatedPosts}
      loveCount={loveData.count}
      userLoved={loveData.loved}
    />
  )
}