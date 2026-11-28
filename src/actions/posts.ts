'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/supabase/server'

const LOCALE_KEYS = ['ar', 'en', 'ru'] as const

/**
 * Server actions used to swallow every failure, so a broken save looked like a
 * button that spins forever with nothing in the logs. Each step is now timed
 * and failures are logged with a stack.
 */
function timer(action: string) {
  const startedAt = Date.now()
  return (step: string) => {
    console.log(`[${action}] ${step} +${Date.now() - startedAt}ms`)
  }
}

function failure(action: string, e: unknown) {
  const aborted =
    e instanceof Error && (e.name === 'AbortError' || /aborted|timeout/i.test(e.message))
  console.error(`[${action}] failed${aborted ? ' (timed out)' : ''}`, e)
  if (aborted) {
    return { error: 'The server could not reach the database in time. Please try again.' }
  }
  return { error: e instanceof Error ? e.message : 'Unknown error' }
}

const translationSchema = z.object({
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  content: z.string().optional().default(''),
})

const createPostSchema = z.object({
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  cover_image: z.string().optional().default(''),
  category: z.enum(['technology', 'project']).default('technology'),
  published: z.boolean().default(true),
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
  const mark = timer('createPost')
  try {
    const user = await getCurrentUser()
    mark('auth')
    if (!user) {
      console.warn('[createPost] rejected: no signed-in user')
      return { error: 'Unauthorized' }
    }

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

    mark('insert post')
    if (postError) {
      console.error('[createPost] post insert failed', postError)
      if (postError.code === '23505') {
        return { error: `A post with the slug "${validated.data.slug}" already exists.` }
      }
      return { error: postError.message }
    }
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

    mark('insert translations')
    if (transError) {
      console.error('[createPost] translations insert failed', transError)
      return { error: transError.message }
    }

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
    mark('revalidated')
    return { success: true, slug: validated.data.slug, locale }
  } catch (e) {
    return failure('createPost', e)
  }
}

export async function updatePost(id: string, formData: FormData) {
  const mark = timer('updatePost')
  try {
    const user = await getCurrentUser()
    mark('auth')
    if (!user) {
      console.warn('[updatePost] rejected: no signed-in user')
      return { error: 'Unauthorized' }
    }

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
    const { data: existing } = await admin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!existing) return { error: 'Post not found' }
    if (existing.author_id !== user.id) return { error: 'Forbidden' }

    const { error: postError } = await admin
      .from('posts')
      .update({
        slug: validated.data.slug,
        cover_image: validated.data.cover_image,
        category: validated.data.category,
        published: validated.data.published,
      })
      .eq('id', id)
      .eq('author_id', user.id)

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
    mark('revalidated')
    return { success: true, slug: validated.data.slug, locale }
  } catch (e) {
    return failure('updatePost', e)
  }
}

export async function deletePost(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const locale = formData.get('locale') as string || 'ar'

    const user = await getCurrentUser()
    if (!user) return { error: 'Unauthorized' }

    const admin = createAdminClient()
    const { data: existing } = await admin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!existing) return { error: 'Post not found' }
    if (existing.author_id !== user.id) return { error: 'Forbidden' }

    const { error } = await admin.from('posts').delete().eq('id', id).eq('author_id', user.id)
    if (error) return { error: error.message }

    revalidatePath(`/${locale}/dashboard/posts`)
    revalidatePath(`/${locale}/blog`)
    return { success: true }
  } catch (e) {
    return failure('deletePost', e)
  }
}