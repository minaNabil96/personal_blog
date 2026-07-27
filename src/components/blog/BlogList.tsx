'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import dayjs from 'dayjs'
import { Search } from 'lucide-react'
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
}

const POSTS_PER_PAGE = 9

export default function BlogList({
  dictionary,
  posts,
  currentPage,
  totalPages,
}: BlogListProps) {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const [search, setSearch] = useState('')

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-zinc-100">{dictionary.blog.title}</h1>
          <p className="mt-2 text-zinc-400">{dictionary.blog.subtitle}</p>
        </div>

        <div className="relative mx-auto mb-12 max-w-md">
          <Search className="absolute inset-bs-1/2 start-3 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder={dictionary.blog.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 ps-10 pe-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-zinc-500">{dictionary.blog.no_posts}</p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post, i) => (
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
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                {currentPage > 1 && (
                  <Link href={`/${locale}/blog?page=${currentPage - 1}`}>
                    <Button variant="secondary" size="sm">
                      {dictionary.blog.previous}
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-zinc-500">
                  {dictionary.blog.page} {currentPage} / {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link href={`/${locale}/blog?page=${currentPage + 1}`}>
                    <Button variant="secondary" size="sm">
                      {dictionary.blog.next}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
