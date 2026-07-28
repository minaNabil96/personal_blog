'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import dayjs from 'dayjs'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover_image?: string
  created_at: string
  tags: string[]
}

interface BlogListProps {
  dictionary: {
    blog: {
      title: string
      subtitle: string
      search: string
      no_posts: string
      previous: string
      next: string
      page: string
    }
  }
  posts: Post[]
  currentPage: number
  totalPages: number
  search: string
  locale: string
}

const MAX_VISIBLE_PAGES = 5

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= MAX_VISIBLE_PAGES + 2) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('ellipsis')
  if (total > 1) pages.push(total)
  return pages
}

export default function BlogList({
  dictionary,
  posts,
  currentPage,
  totalPages,
  search,
  locale,
}: BlogListProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(search)

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    router.push(`/${locale}/blog${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }, [searchInput, locale, router])

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-zinc-100">{dictionary.blog.title}</h1>
          <p className="mt-2 text-zinc-400">{dictionary.blog.subtitle}</p>
        </div>

        <form onSubmit={handleSearch} className="relative mx-auto mb-12 max-w-md">
          <Search className="absolute inset-bs-1/2 start-3 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder={dictionary.blog.search}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 ps-10 pe-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </form>

        {posts.length === 0 ? (
          <p className="text-center text-zinc-500">
            {search ? `No results for "${search}"` : dictionary.blog.no_posts}
          </p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                  <Card
                    glass
                    className="group h-full transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl"
                    data-aos="fade-up"
                    data-aos-delay={i * 50}
                  >
                    {post.cover_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardContent className="flex flex-col gap-3">
                      <time className="text-xs text-zinc-500">
                        {dayjs(post.created_at).format('MMM D, YYYY')}
                      </time>
                      <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-1.5">
                {currentPage > 1 && (
                  <Link
                    href={`/${locale}/blog?page=${currentPage - 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100 hover:bg-zinc-800/50"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">{dictionary.blog.previous}</span>
                  </Link>
                )}

                {getPageNumbers(currentPage, totalPages).map((p, i) =>
                  p === 'ellipsis' ? (
                    <span key={`e${i}`} className="px-2 text-sm text-zinc-600">...</span>
                  ) : (
                    <Link
                      key={p}
                      href={`/${locale}/blog?page=${p}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors ${
                        p === currentPage
                          ? 'bg-cyan-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}

                {currentPage < totalPages && (
                  <Link
                    href={`/${locale}/blog?page=${currentPage + 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100 hover:bg-zinc-800/50"
                  >
                    <span className="hidden sm:inline">{dictionary.blog.next}</span>
                    <ChevronRight size={16} />
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  )
}
