'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import type { Schema } from 'hast-util-sanitize'
import { useState, useCallback } from 'react'
import dayjs from 'dayjs'
import { ArrowRight, ArrowLeft, Calendar, User, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { CodeBlock } from '@/components/blog/CodeBlock'
import { DiagramBlock } from '@/components/blog/DiagramBlock'
import { ProseImage } from '@/components/blog/ProseImage'
import type { Components } from 'react-markdown'

const sanitizeSchema: Schema = {
  attributes: {
    '*': ['className'],
    div: ['className', 'itemScope', 'itemType'],
    span: ['className'],
    img: ['className', 'loading', 'ariaDescribedBy', 'ariaLabel', 'ariaLabelledBy', 'longDesc', 'src'],
    code: [['className', /^language-|hljs/]],
  },
  strip: ['script'],
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image?: string
  created_at: string
  author?: string
  author_avatar?: string | null
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
  loveCount: number
  userLoved: boolean
}

function LoveButton({ postId, initialCount, initialLoved }: { postId: string; initialCount: number; initialLoved: boolean }) {
  const [count, setCount] = useState(initialCount)
  const [loved, setLoved] = useState(initialLoved)
  const [loading, setLoading] = useState(false)

  const toggle = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/love`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setCount(data.count)
      setLoved(data.loved)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [postId, loading])

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
        loved
          ? 'bg-red-500/20 border-red-500/50 text-red-400'
          : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
      }`}
      aria-pressed={loved}
      aria-label={loved ? 'Unlike' : 'Like'}
    >
      <Heart
        size={18}
        className={loved ? 'fill-current' : 'fill-none'}
        strokeWidth={2}
      />
      <span className="text-sm font-medium">{count}</span>
    </button>
  )
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
  loveCount,
  userLoved,
}: ArticleDetailProps) {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const isRtl = locale === 'ar'
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  return (
    <article className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        {post.cover_image && (
          <div className="relative w-full aspect-[16/9] max-h-[480px] overflow-hidden rounded-2xl bg-zinc-900">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
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
              <span className="flex items-center gap-2">
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt={post.author}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <User size={14} />
                )}
                {dictionary.article.by} {post.author}
              </span>
            )}
            <LoveButton postId={post.id} initialCount={loveCount} initialLoved={userLoved} />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-zinc-100 sm:text-3xl md:text-4xl">
            {post.title}
          </h1>
        </div>

        <div className="prose prose-invert max-w-none leading-loose text-justify">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
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
                      <h3 className="mt-2 text-base font-semibold text-zinc-100 group-hover:text-white transition-colors sm:text-lg">
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