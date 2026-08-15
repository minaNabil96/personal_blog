import type { Metadata } from 'next'
import Link from 'next/link'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import { PostsTable } from '@/components/dashboard/PostsTable'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  return { title: dict.dashboard.posts || 'Posts' }
}

export default async function PostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, category, published, created_at, post_translations(title, language), post_view_counts(view_count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">{dict.dashboard.posts || 'Posts'}</h1>
          <p className="mt-1 text-zinc-400">{dict.dashboard.postsDesc || 'Manage your blog posts'}</p>
        </div>
        <Link
          href={`/${locale}/dashboard/posts/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
        >
          <span className="h-4 w-4" aria-hidden="true">+</span>
          {dict.dashboard.createPost || 'New Post'}
        </Link>
      </div>

      <PostsTable locale={locale} posts={posts || []} />
    </div>
  )
}
