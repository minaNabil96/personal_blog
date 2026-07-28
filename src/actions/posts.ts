'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const LOCALE_KEYS = ['ar', 'en', 'ru'] as const

const translationSchema = z.object({
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  content: z.string().optional().default(''),
})

const createPostSchema = z.object({
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  cover_image: z.string().optional().default(''),
  category: z.enum(['technology', 'project']).default('technology'),
  published: z.boolean().default(false),
  translations: z.object({
    ar: translationSchema,
    en: translationSchema,
    ru: translationSchema,
  }),
  github_url: z.string().optional().default(''),
  live_demo_url: z.string().optional().default(''),
  tech_stack: z.array(z.string()).default([]),
})

type CreatePostInput = z.infer<typeof createPostSchema>

export async function createPost(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => { raw[key] = value })

    const translations = {
      ar: {
        title: raw['translations.ar.title'] !== undefined ? String(raw['translations.ar.title']) : '',
        description: raw['translations.ar.description'] !== undefined ? String(raw['translations.ar.description']) : '',
        content: raw['translations.ar.content'] !== undefined ? String(raw['translations.ar.content']) : '',
      },
      en: {
        title: raw['translations.en.title'] !== undefined ? String(raw['translations.en.title']) : '',
        description: raw['translations.en.description'] !== undefined ? String(raw['translations.en.description']) : '',
        content: raw['translations.en.content'] !== undefined ? String(raw['translations.en.content']) : '',
      },
      ru: {
        title: raw['translations.ru.title'] !== undefined ? String(raw['translations.ru.title']) : '',
        description: raw['translations.ru.description'] !== undefined ? String(raw['translations.ru.description']) : '',
        content: raw['translations.ru.content'] !== undefined ? String(raw['translations.ru.content']) : '',
      },
    }
    
    const input: CreatePostInput = {
      slug: raw.slug !== undefined ? String(raw.slug) : '',
      cover_image: raw.cover_image !== undefined ? String(raw.cover_image) : '',
      category: (raw.category as 'technology' | 'project') || 'technology',
      published: raw.published === 'true',
      translations,
      github_url: raw.github_url !== undefined ? String(raw.github_url) : '',
      live_demo_url: raw.live_demo_url !== undefined ? String(raw.live_demo_url) : '',
      tech_stack: formData.getAll('tech_stack').map(String),
    }

    const validated = createPostSchema.safeParse(input)
    if (!validated.success) {
      return { error: 'Validation failed', details: validated.error.flatten() }
    }

    const admin = createAdminClient()
    const { data: post, error: postError } = await admin
      .from('posts')
      .insert({
        author_id: user.id,
        slug: validated.data.slug,
        cover_image: validated.data.cover_image,
        category: validated.data.category,
        published: validated.data.published,
      })
      .select()
      .single()

    if (postError) return { error: postError.message }
    if (!post) return { error: 'Failed to create post' }

    const translationsToInsert = LOCALE_KEYS.map((locale) => ({
      post_id: post.id,
      language: locale,
      title: validated.data.translations[locale].title,
      description: validated.data.translations[locale].description,
      content: validated.data.translations[locale].content,
    }))

    const { error: transError } = await admin
      .from('post_translations')
      .insert(translationsToInsert)

    if (transError) return { error: transError.message }

    if (validated.data.category === 'project') {
      const { error: metaError } = await admin
        .from('projects_meta')
        .insert({
          post_id: post.id,
          github_url: validated.data.github_url,
          live_demo_url: validated.data.live_demo_url,
          tech_stack: validated.data.tech_stack,
        })

      if (metaError) return { error: metaError.message }
    }

    const locale = formData.get('locale') as string || 'ar'
    revalidatePath(`/${locale}/dashboard/posts`)
    revalidatePath(`/${locale}/blog`)
    return { success: true, slug: validated.data.slug, locale }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function updatePost(id: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => { raw[key] = value })

    const translations = {
      ar: {
        title: raw['translations.ar.title'] !== undefined ? String(raw['translations.ar.title']) : '',
        description: raw['translations.ar.description'] !== undefined ? String(raw['translations.ar.description']) : '',
        content: raw['translations.ar.content'] !== undefined ? String(raw['translations.ar.content']) : '',
      },
      en: {
        title: raw['translations.en.title'] !== undefined ? String(raw['translations.en.title']) : '',
        description: raw['translations.en.description'] !== undefined ? String(raw['translations.en.description']) : '',
        content: raw['translations.en.content'] !== undefined ? String(raw['translations.en.content']) : '',
      },
      ru: {
        title: raw['translations.ru.title'] !== undefined ? String(raw['translations.ru.title']) : '',
        description: raw['translations.ru.description'] !== undefined ? String(raw['translations.ru.description']) : '',
        content: raw['translations.ru.content'] !== undefined ? String(raw['translations.ru.content']) : '',
      },
    }

    const input: CreatePostInput = {
      slug: raw.slug !== undefined ? String(raw.slug) : '',
      cover_image: raw.cover_image !== undefined ? String(raw.cover_image) : '',
      category: (raw.category as 'technology' | 'project') || 'technology',
      published: raw.published === 'true',
      translations,
      github_url: raw.github_url !== undefined ? String(raw.github_url) : '',
      live_demo_url: raw.live_demo_url !== undefined ? String(raw.live_demo_url) : '',
      tech_stack: formData.getAll('tech_stack').map(String),
    }

    const validated = createPostSchema.safeParse(input)
    if (!validated.success) {
      return { error: 'Validation failed', details: validated.error.flatten() }
    }

    const admin = createAdminClient()
    const { error: postError } = await admin
      .from('posts')
      .update({
        slug: validated.data.slug,
        cover_image: validated.data.cover_image,
        category: validated.data.category,
        published: validated.data.published,
      })
      .eq('id', id)

    if (postError) return { error: postError.message }

    for (const locale of LOCALE_KEYS) {
      const { error: transError } = await admin
        .from('post_translations')
        .upsert({
          post_id: id,
          language: locale,
          title: validated.data.translations[locale].title,
          description: validated.data.translations[locale].description,
          content: validated.data.translations[locale].content,
        }, { onConflict: 'post_id,language' })

      if (transError) return { error: transError.message }
    }

    if (validated.data.category === 'project') {
      const { error: metaError } = await admin
        .from('projects_meta')
        .upsert({
          post_id: id,
          github_url: validated.data.github_url,
          live_demo_url: validated.data.live_demo_url,
          tech_stack: validated.data.tech_stack,
        }, { onConflict: 'post_id' })

      if (metaError) return { error: metaError.message }
    }

    const locale = formData.get('locale') as string || 'ar'
    revalidatePath(`/${locale}/dashboard/posts`)
    revalidatePath(`/${locale}/blog`)
    return { success: true, slug: validated.data.slug, locale }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function deletePost(id: string, locale: string = 'ar') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const admin = createAdminClient()
  await admin.from('posts').delete().eq('id', id)

  revalidatePath(`/${locale}/dashboard/posts`)
}