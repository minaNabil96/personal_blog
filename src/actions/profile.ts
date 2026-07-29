'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('authors')
    .select('id, username, avatar_url')
    .eq('id', user.id)
    .single()

  return data
}

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const username = formData.get('username') as string
    const avatar_url = formData.get('avatar_url') as string

    const { error } = await supabase
      .from('authors')
      .upsert({
        id: user.id,
        username: username || 'Author',
        avatar_url: avatar_url || null,
      }, { onConflict: 'id' })

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/profile`)
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
