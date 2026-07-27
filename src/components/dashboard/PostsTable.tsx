import Link from 'next/link'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import dayjs from 'dayjs'
import { deletePost } from '@/actions/posts'

export async function PostsTable({ locale }: { locale: string }) {
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, category, published, created_at, post_translations(title, language)')
    .order('created_at', { ascending: false })

  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
      {!posts || posts.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-zinc-500">{dict.dashboard?.noPosts || 'No posts yet'}</p>
          <Link
            href={`/${locale}/dashboard/posts/new`}
            className="mt-4 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
          >
            {dict.dashboard?.createPost || 'Create your first post'}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 text-zinc-400">
                <th className="px-4 py-3 text-start font-medium">{dict.dashboard?.title || 'Title'}</th>
                <th className="px-4 py-3 text-start font-medium hidden md:table-cell">{dict.dashboard?.category || 'Category'}</th>
                <th className="px-4 py-3 text-start font-medium hidden sm:table-cell">{dict.dashboard?.status || 'Status'}</th>
                <th className="px-4 py-3 text-start font-medium hidden lg:table-cell">{dict.dashboard?.date || 'Date'}</th>
                <th className="px-4 py-3 text-end font-medium">{dict.dashboard?.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {posts.map((post) => {
                const translation = post.post_translations?.find(t => t.language === locale) ||
                  post.post_translations?.[0]
                return (
                  <tr key={post.id} className="transition-colors hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${post.published ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <span className="font-medium text-zinc-200 truncate max-w-[200px] block">
                          {translation?.title || 'Untitled'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                      <span className="rounded-md bg-zinc-800/50 px-2 py-0.5 text-xs capitalize">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium ${post.published ? 'text-green-400' : 'text-amber-400'}`}>
                        {post.published
                          ? (dict.dashboard?.published || 'Published')
                          : (dict.dashboard?.draft || 'Draft')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell">
                      {dayjs(post.created_at).format('MMM D, YYYY')}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/dashboard/posts/${post.id}/edit`}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 transition-colors hover:bg-zinc-800/50"
                        >
                          {dict.dashboard?.edit || 'Edit'}
                        </Link>
                        <form action={deletePost.bind(null, post.id, locale)}>
                          <button
                            type="submit"
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-zinc-800/50"
                            onClick={(e) => {
                              if (!confirm(dict.dashboard?.confirmDelete || 'Are you sure?')) {
                                e.preventDefault()
                              }
                            }}
                          >
                            {dict.dashboard?.deletePost || 'Delete'}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}