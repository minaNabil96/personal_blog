import ArticleSkeleton from '@/components/blog/ArticleSkeleton'

export default function Loading() {
  return (
    <article className="px-4 py-20 sm:px-6 sm:py-24">
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading article…</span>
        <ArticleSkeleton />
      </div>
    </article>
  )
}
