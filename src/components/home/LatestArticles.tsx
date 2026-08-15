'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import dayjs from 'dayjs'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ClampedText } from '@/components/ui/ClampedText'

interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover_image?: string
  created_at: string
}

interface LatestArticlesProps {
  dictionary: {
    articles: { title: string; read_more: string; no_articles: string }
  }
  articles: Article[]
}

export default function LatestArticles({ dictionary, articles }: LatestArticlesProps) {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const isRtl = locale === 'ar'
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-zinc-100" data-aos="fade-up">
            {dictionary.articles.title}
          </h2>
          <div
            className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600"
            data-aos="fade-up"
            data-aos-delay="100"
          />
        </div>

        {articles.length === 0 ? (
          <p className="text-zinc-500">{dictionary.articles.no_articles}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 4).map((article, i) => (
              <Link key={article.id} href={`/${locale}/blog/${article.slug}`}>
                <Card
                  glass
                  className="group h-full transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl"
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                >
                  {article.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="flex flex-col gap-3">
                    <time className="text-xs text-zinc-500">
                      {dayjs(article.created_at).format('MMM D, YYYY')}
                    </time>
                    <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <ClampedText lines={2} className="text-sm leading-relaxed text-zinc-400">
                        {article.excerpt}
                      </ClampedText>
                    )}
                    <span className="mt-auto flex items-center gap-1 text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                      {dictionary.articles.read_more}
                      <Arrow size={14} />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
