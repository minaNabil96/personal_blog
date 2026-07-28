'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Save, Globe, Code, Plus } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Switch from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPost, updatePost } from '@/actions/posts'
import { useToast } from '@/components/ui/toast'

const LOCALES = ['ar', 'en', 'ru'] as const

const postFormSchema = z.object({
  slug: z.string().default(''),
  cover_image: z.string().default(''),
  category: z.enum(['technology', 'project']),
  published: z.boolean(),
  'translations.ar.title': z.string().default(''),
  'translations.ar.description': z.string().default(''),
  'translations.ar.content': z.string().default(''),
  'translations.en.title': z.string().default(''),
  'translations.en.description': z.string().default(''),
  'translations.en.content': z.string().default(''),
  'translations.ru.title': z.string().default(''),
  'translations.ru.description': z.string().default(''),
  'translations.ru.content': z.string().default(''),
  github_url: z.string().default(''),
  live_demo_url: z.string().default(''),
})

type PostFormValues = z.input<typeof postFormSchema>

type PostEditData = {
  id: string
  slug: string
  cover_image: string | null
  category: string
  published: boolean
  post_translations: {
    language: string
    title: string
    description: string | null
    content: string | null
  }[]
  projects_meta?: {
    github_url: string | null
    live_demo_url: string | null
    tech_stack: string[]
  } | null
}

const localeLabels: Record<string, string> = {
  ar: 'العربية',
  en: 'English',
  ru: 'Русский',
}

export function PostForm({ locale, post }: { locale: string; post?: PostEditData }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState(locale)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [techStack, setTechStack] = useState<string[]>(post?.projects_meta?.tech_stack || [])
  const [techInput, setTechInput] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      slug: post?.slug || '',
      cover_image: post?.cover_image || '',
      category: (post?.category as 'technology' | 'project') || 'technology',
      published: post?.published || false,
      'translations.ar.title': post?.post_translations?.find(t => t.language === 'ar')?.title || '',
      'translations.ar.description': post?.post_translations?.find(t => t.language === 'ar')?.description || '',
      'translations.ar.content': post?.post_translations?.find(t => t.language === 'ar')?.content || '',
      'translations.en.title': post?.post_translations?.find(t => t.language === 'en')?.title || '',
      'translations.en.description': post?.post_translations?.find(t => t.language === 'en')?.description || '',
      'translations.en.content': post?.post_translations?.find(t => t.language === 'en')?.content || '',
      'translations.ru.title': post?.post_translations?.find(t => t.language === 'ru')?.title || '',
      'translations.ru.description': post?.post_translations?.find(t => t.language === 'ru')?.description || '',
      'translations.ru.content': post?.post_translations?.find(t => t.language === 'ru')?.content || '',
      github_url: post?.projects_meta?.github_url || '',
      live_demo_url: post?.projects_meta?.live_demo_url || '',
    },
  })

  const category = watch('category')
  const slug = watch('slug')
  const coverImage = watch('cover_image')

  const generateSlug = useCallback((title: string) => {
    if (slug) return
    const s = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (s) setValue('slug', s)
  }, [slug, setValue])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      addToast('Image must be under 4MB', 'error')
      return
    }

    if (!file.type.startsWith('image/')) {
      addToast('Only image files are allowed', 'error')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const data = await res.json()

      if (!res.ok) {
        addToast(data.error || 'Upload failed', 'error')
        return
      }

      if (data.url) {
        setValue('cover_image', data.url)
        addToast('Image uploaded', 'success')
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        addToast('Upload timed out. Try a smaller image.', 'error')
      } else {
        addToast('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error')
      }
    } finally {
      setUploading(false)
    }
  }

  const addTechStack = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()])
      setTechInput('')
    }
  }

  const removeTechStack = (index: number) => {
    setTechStack(techStack.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PostFormValues) => {
    setSubmitting(true)
    try {
      const titles = [data['translations.ar.title'], data['translations.en.title'], data['translations.ru.title']]
      const nonEmptyTitles = titles.filter(t => t?.trim())
      if (nonEmptyTitles.length === 0) {
        addToast('At least one title is required', 'error')
        setSubmitting(false)
        return
      }

      let slug = data.slug?.trim()
      if (!slug) {
        slug = nonEmptyTitles[0]!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }

      const formData = new FormData()
      
      const setField = (key: string, value: unknown) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, typeof value === 'boolean' ? String(value) : String(value))
        }
      }
      
      setField('slug', slug)
      setField('cover_image', data.cover_image)
      setField('category', data.category)
      setField('published', data.published)
      setField('translations.ar.title', data['translations.ar.title'])
      setField('translations.ar.description', data['translations.ar.description'])
      setField('translations.ar.content', data['translations.ar.content'])
      setField('translations.en.title', data['translations.en.title'])
      setField('translations.en.description', data['translations.en.description'])
      setField('translations.en.content', data['translations.en.content'])
      setField('translations.ru.title', data['translations.ru.title'])
      setField('translations.ru.description', data['translations.ru.description'])
      setField('translations.ru.content', data['translations.ru.content'])
      setField('github_url', data.github_url)
      setField('live_demo_url', data.live_demo_url)
      setField('locale', locale)
      
      techStack.forEach(t => formData.append('tech_stack', t))

      const action = post ? updatePost(post.id, formData) : createPost(formData)
      const result = await action

      if (result && 'error' in result && result.error) {
        addToast(result.error, 'error')
        return
      }

      if (result && 'success' in result && result.success) {
        addToast(
          post
            ? (locale === 'ar' ? 'تم تحديث المقالة بنجاح' : locale === 'ru' ? 'Статья обновлена' : 'Post updated successfully')
            : (locale === 'ar' ? 'تم إنشاء المقالة بنجاح' : locale === 'ru' ? 'Статья создана' : 'Post created successfully'),
          'success'
        )

        setTimeout(() => {
          if (post) {
            router.push(`/${result.locale || locale}/dashboard/posts`)
          } else {
            router.push(`/${result.locale || locale}/blog/${result.slug}`)
          }
        }, 1500)
      }
    } catch (err) {
      addToast('Error: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-xl space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Slug</label>
            <input
              {...register('slug')}
              placeholder="my-post-slug"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p>}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <Switch.Root
              checked={watch('published')}
              onCheckedChange={(v) => setValue('published', v)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                watch('published') ? 'bg-green-600' : 'bg-zinc-700'
              )}
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
            <span className="text-sm text-zinc-300">
              {watch('published') ? 'Published' : 'Draft'}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch.Root
              checked={category === 'project'}
              onCheckedChange={(v) => setValue('category', v ? 'project' : 'technology')}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                category === 'project' ? 'bg-cyan-600' : 'bg-zinc-700'
              )}
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
            <span className="text-sm text-zinc-300">
              {category === 'project' ? 'Project' : 'Technology Article'}
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <Tabs.List className="flex border-b border-zinc-800/50 bg-zinc-950/30">
            {LOCALES.map((l) => (
              <Tabs.Trigger
                key={l}
                value={l}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === l
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <Globe size={14} className="inline-block me-1.5" />
                {localeLabels[l]}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {LOCALES.map((l) => (
            <Tabs.Content key={l} value={l} className="p-6 space-y-4">
              <Input
                label={`Title (${localeLabels[l]})`}
                placeholder="Enter title..."
                error={errors[`translations.${l}.title` as keyof typeof errors]?.message as string}
                {...register(`translations.${l}.title` as keyof PostFormValues, {
                  onChange: (e) => {
                    if (l === 'en') generateSlug(e.target.value)
                  }
                })}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Description ({localeLabels[l]})
                </label>
                <textarea
                  {...register(`translations.${l}.description` as keyof PostFormValues)}
                  rows={3}
                  placeholder="Brief description..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Content (Markdown) ({localeLabels[l]})
                </label>
                <textarea
                  {...register(`translations.${l}.content` as keyof PostFormValues)}
                  rows={16}
                  placeholder="Write your content in Markdown..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono leading-relaxed resize-y min-h-[300px]"
                />
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>

      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Cover Image</h3>

        {coverImage ? (
          <div className="relative group">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full max-h-64 rounded-xl object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = ''
                setValue('cover_image', '')
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors">
                <Upload size={16} />
                Change
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              <button
                type="button"
                onClick={() => setValue('cover_image', '')}
                className="rounded-lg bg-red-500/80 px-4 py-2 text-sm text-white hover:bg-red-500 transition-colors"
              >
                <X size={16} className="inline me-1" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-700 py-12 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300">
            {uploading ? (
              <>
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-600 border-t-cyan-400" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={32} />
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-zinc-500 mt-1">PNG, JPG or WebP</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </>
            )}
          </label>
        )}
      </div>

      <AnimatePresence>
        {category === 'project' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-xl space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-semibold text-zinc-300">Project Details</h3>

            <Input
              label="GitHub URL"
              placeholder="https://github.com/username/repo"
              {...register('github_url')}
            />

            <Input
              label="Live Demo URL"
              placeholder="https://my-project.vercel.app"
              {...register('live_demo_url')}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Tech Stack</label>
              <div className="flex items-center gap-2 mb-3">
                <input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechStack() } }}
                  placeholder="Add technology..."
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addTechStack}>
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/70 px-3 py-1 text-xs text-zinc-300">
                    <Code size={12} />
                    {tech}
                    <button type="button" onClick={() => removeTechStack(i)} className="text-zinc-500 hover:text-red-400">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" size="lg" loading={submitting}>
          <Save size={18} />
          {post ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  )
}