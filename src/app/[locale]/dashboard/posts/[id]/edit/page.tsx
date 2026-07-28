import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { createAdminClient } from '@/lib/supabase/admin'
import { PostForm } from '@/components/dashboard/PostForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  return { title: dict.dashboard?.editPost || 'Edit Post' }
}

export default async function EditPostPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')

  const admin = createAdminClient()
  const { data: post } = await admin
    .from('posts')
    .select('id, slug, cover_image, category, published, post_translations(language, title, description, content), projects_meta(github_url, live_demo_url, tech_stack)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">{dict.dashboard?.editPost || 'Edit Post'}</h1>
        <p className="mt-1 text-zinc-400">{dict.dashboard?.editPostDesc || 'Update your blog post'}</p>
      </div>
      <PostForm locale={locale} post={post as any} />
    </div>
  )
}