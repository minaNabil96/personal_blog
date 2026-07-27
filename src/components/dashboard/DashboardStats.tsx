import { getDictionary } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'

export async function DashboardStats({ locale }: { locale: string }) {
  const dict = await getDictionary(locale as 'ar' | 'en' | 'ru')
  const supabase = await createClient()

  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })

  const { count: publishedPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  const { count: draftPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', false)

  const stats = [
    { label: dict.dashboard?.totalPosts || 'Total Posts', value: totalPosts || 0, color: 'from-cyan-500 to-blue-600' },
    { label: dict.dashboard?.publishedPosts || 'Published', value: publishedPosts || 0, color: 'from-green-500 to-emerald-600' },
    { label: dict.dashboard?.draftPosts || 'Drafts', value: draftPosts || 0, color: 'from-amber-500 to-orange-600' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <span className="text-lg font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-zinc-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}