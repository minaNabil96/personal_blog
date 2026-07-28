'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import dayjs from 'dayjs'
import { ArrowRight, ArrowLeft, Calendar, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image?: string
  created_at: string
  author?: string
  tags: string[]
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  cover_image?: string
  created_at: string
}

interface ArticleDetailProps {
  dictionary: {
    article: { by: string; read_next: string }
  }
  post: Post
  relatedPosts: RelatedPost[]
}

export default function ArticleDetail({
  dictionary,
  post,
  relatedPosts,
}: ArticleDetailProps) {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const isRtl = locale === 'ar'
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  return (
    <article className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        {post.cover_image && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {dayjs(post.created_at).format('MMMM D, YYYY')}
            </span>
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {dictionary.article.by} {post.author}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-zinc-100 sm:text-4xl">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-bold prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-zinc-200 prose-code:text-cyan-300 prose-code:bg-zinc-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-zinc-800/50 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-img:rounded-xl prose-img:my-8 prose-hr:border-zinc-800 prose-blockquote:border-cyan-500/50 prose-blockquote:text-zinc-400 prose-blockquote:not-italic prose-li:text-zinc-300 [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_th]:border [&_th]:border-zinc-700 [&_th]:bg-zinc-800/50 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-zinc-200 [&_th]:font-semibold [&_th]:text-sm [&_td]:border [&_td]:border-zinc-700 [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-sm [&_td]:text-zinc-300 [&_tr:last-child_td]:border-b-0">
          <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-2xl font-bold text-zinc-100">
              {dictionary.article.read_next}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} href={`/${locale}/blog/${rp.slug}`}>
                  <Card glass className="group transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl">
                    {rp.cover_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={rp.cover_image}
                          alt={rp.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardContent>
                      <time className="text-xs text-zinc-500">
                        {dayjs(rp.created_at).format('MMM D, YYYY')}
                      </time>
                      <h3 className="mt-2 text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                        {rp.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
