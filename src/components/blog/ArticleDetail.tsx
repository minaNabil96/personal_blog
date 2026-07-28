'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import dayjs from 'dayjs'
import { ArrowRight, ArrowLeft, Calendar, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { CodeBlock } from '@/components/blog/CodeBlock'
import { DiagramBlock } from '@/components/blog/DiagramBlock'
import { ProseImage } from '@/components/blog/ProseImage'
import type { Components } from 'react-markdown'
import type { ReactNode } from 'react'

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

const components: Partial<Components> = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const lang = match?.[1]
    const isInline = !match && !className
    const code = String(children)

    if (isInline) {
      return <code className={className} {...props}>{children}</code>
    }

    if (lang === 'mermaid' || lang === 'dot' || lang === 'graphviz' || lang === 'plantuml' || lang === 'puml') {
      return <DiagramBlock lang={lang} code={code} />
    }

    return <CodeBlock className={className}>{code}</CodeBlock>
  },
  pre({ children }) {
    return <>{children}</>
  },
  img({ src, alt, title }) {
    return <ProseImage src={src} alt={alt} title={title} />
  },
  table({ children }) {
    return (
      <div className="max-w-full overflow-x-auto rounded-xl border border-zinc-800/50 my-6">
        <table className="w-full border-collapse">{children}</table>
      </div>
    )
  },
  th({ children }) {
    return <th className="border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm font-semibold text-zinc-200">{children}</th>
  },
  td({ children }) {
    return <td className="border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300">{children}</td>
  },
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
        </div>

        <div className="prose prose-invert max-w-none leading-loose">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={components}
          >
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
