'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/actions/posts'
import dayjs from 'dayjs'
import { Trash2, Edit } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export function PostsTable({ locale, posts }: { locale: string; posts: any[] }) {
  const router = useRouter()
  const { addToast } = useToast()

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const formData = new FormData()
    formData.append('id', postId)
    formData.append('locale', locale)

    const result = await deletePost(formData)
    if (result && 'error' in result && result.error) {
      addToast(result.error, 'error')
    } else {
      addToast('Post deleted', 'success')
      router.refresh()
    }
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-12 text-center">
        <p className="text-zinc-500">No posts yet</p>
        <Link
          href={`/${locale}/dashboard/posts/new`}
          className="mt-4 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
        >
          Create your first post
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/50 text-zinc-400">
              <th className="px-4 py-3 text-start font-medium">Title</th>
              <th className="px-4 py-3 text-start font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-start font-medium hidden sm:table-cell">Status</th>
              <th className="px-4 py-3 text-start font-medium hidden lg:table-cell">Date</th>
              <th className="px-4 py-3 text-start font-medium hidden md:table-cell">Views</th>
              <th className="px-4 py-3 text-end font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {posts.map((post: any) => {
              const translation = post.post_translations?.find((t: any) => t.language === locale) ||
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
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell">
                    {dayjs(post.created_at).format('MMM D, YYYY')}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                    {post.post_view_counts?.[0]?.view_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/${locale}/dashboard/posts/${post.id}/edit`}
                        className="rounded-lg p-2.5 text-cyan-400 transition-colors hover:bg-zinc-800/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="rounded-lg p-2.5 text-red-400 transition-colors hover:bg-zinc-800/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
