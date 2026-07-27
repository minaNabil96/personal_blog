import Link from 'next/link'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import dayjs from 'dayjs'

export async function RecentPosts({ locale }: { locale: string }) {
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, published, created_at, post_translations(title, language)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-100">{dict.dashboard?.recentPosts || 'Recent Posts'}</h2>
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
        {!posts || posts.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">{dict.dashboard?.noPosts || 'No posts yet'}</p>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {posts.map((post) => {
              const translation = post.post_translations?.find(t => t.language === locale) ||
                post.post_translations?.[0]
              return (
                <Link
                  key={post.id}
                  href={`/${locale}/dashboard/posts/${post.id}/edit`}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-800/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${post.published ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="truncate text-sm font-medium text-zinc-200">
                      {translation?.title || 'Untitled'}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {dayjs(post.created_at).format('MMM D, YYYY')}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}