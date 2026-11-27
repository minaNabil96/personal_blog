const PARAGRAPH_WIDTHS = ['w-full', 'w-11/12', 'w-full', 'w-10/12', 'w-full', 'w-9/12']
const SECOND_PARAGRAPH_WIDTHS = ['w-full', 'w-full', 'w-11/12', 'w-8/12']

export default function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="aspect-[16/9] max-h-[480px] w-full rounded-2xl bg-zinc-900" />

      <div className="mb-8 mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-4 w-28 rounded bg-zinc-800" />
          <div className="h-4 w-24 rounded bg-zinc-800" />
          <div className="h-4 w-16 rounded bg-zinc-800" />
        </div>
        <div className="h-8 w-11/12 rounded bg-zinc-800 sm:h-10" />
        <div className="h-8 w-2/3 rounded bg-zinc-800 sm:h-10" />
      </div>

      <div className="space-y-3">
        {PARAGRAPH_WIDTHS.map((width, index) => (
          <div key={`line-${index}`} className={`h-4 rounded bg-zinc-800/80 ${width}`} />
        ))}
      </div>

      <div className="mt-10 space-y-3">
        {SECOND_PARAGRAPH_WIDTHS.map((width, index) => (
          <div key={`line-2-${index}`} className={`h-4 rounded bg-zinc-800/80 ${width}`} />
        ))}
      </div>
    </div>
  )
}
