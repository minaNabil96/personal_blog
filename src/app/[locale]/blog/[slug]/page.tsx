import { notFound } from 'next/navigation'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import ArticleDetail from '@/components/blog/ArticleDetail'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('id, slug, cover_image, category, published, created_at, author_id, post_translations(language, title, description, content)')
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

  const article = {
    id: post.id,
    title: translation?.title || '',
    slug: post.slug,
    content: typeof translation?.content === 'string' ? translation.content : '',
    excerpt: translation?.description || '',
    cover_image: post.cover_image || '',
    created_at: post.created_at,
    author_id: post.author_id,
    tags: [] as string[],
  }

  return (
    <ArticleDetail
      dictionary={dict}
      post={article}
      relatedPosts={relatedPosts}
    />
  )
}