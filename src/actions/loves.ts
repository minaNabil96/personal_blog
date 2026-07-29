'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLove(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Check if already loved
  const { data: existing } = await supabase
    .from('post_loves')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('post_loves')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    return { success: true, loved: false }
  } else {
    // Like
    const { error } = await supabase
      .from('post_loves')
      .insert({ post_id: postId, user_id: user.id })

    if (error) return { error: error.message }
    return { success: true, loved: true }
  }
}

export async function getLoveCount(postId: string) {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('post_loves')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  if (error) return { error: error.message, count: 0 }
  return { count: count || 0 }
}

export async function getUserLovedStatus(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { loved: false }

  const { data } = await supabase
    .from('post_loves')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  return { loved: !!data }
}

export async function getLoveData(postId: string) {
  const supabase = await createClient()

  const [countRes, userLovedRes] = await Promise.all([
    getLoveCount(postId),
    getUserLovedStatus(postId),
  ])

  return {
    count: countRes.count,
    loved: userLovedRes.loved,
  }
}