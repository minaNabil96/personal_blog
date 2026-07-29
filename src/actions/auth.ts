'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  })

  if (error) {
    const messages: Record<string, string> = {
      invalid_credentials: 'Invalid email or password.',
      email_not_confirmed: 'Please confirm your email before signing in.',
      user_not_found: 'No account found with this email.',
      email_exists: 'An account with this email already exists.',
      weak_password: 'Password is too weak.',
      over_email_send_rate_limit: 'Too many attempts. Please try again later.',
      over_request_rate_limit: 'Too many requests. Please wait and try again.',
    }
    return { error: messages[error.code ?? ''] || 'Invalid email or password.' }
  }

  const locale = formData.get('locale') as string || 'ar'
  redirect(`/${locale}/dashboard`)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}