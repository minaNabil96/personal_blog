'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(formData: FormData) {
  const validated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { error: 'Invalid form data.' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  })

  if (error || !data.session) {
    return { error: 'Invalid email or password.' }
  }

  // Set cookies manually
  const cookieStore = await cookies()
  
  cookieStore.set('sb-aezhalzpeitbnxjqcylb-auth-token', data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  
  cookieStore.set('sb-aezhalzpeitbnxjqcylb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  const locale = formData.get('locale') as string || 'ar'
  redirect(`/${locale}/dashboard`)
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('sb-aezhalzpeitbnxjqcylb-auth-token')
  cookieStore.delete('sb-aezhalzpeitbnxjqcylb-refresh-token')
  redirect('/')
}