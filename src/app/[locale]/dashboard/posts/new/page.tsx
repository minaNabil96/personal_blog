import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { PostForm } from '@/components/dashboard/PostForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  return { title: dict.dashboard?.createPost || 'New Post' }
}

export default async function NewPostPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">{dict.dashboard?.createPost || 'New Post'}</h1>
        <p className="mt-1 text-zinc-400">{dict.dashboard?.createPostDesc || 'Create a new blog post or project'}</p>
      </div>
      <PostForm locale={locale} />
    </div>
  )
}