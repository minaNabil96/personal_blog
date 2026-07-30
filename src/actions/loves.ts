'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

function getIpFromHeaders(headersList: Headers): string {
  return headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headersList.get('x-real-ip')
    || 'unknown'
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
  const headersList = await headers()
  const ip = getIpFromHeaders(headersList)
  if (ip === 'unknown') return { loved: false }

  const supabase = await createClient()

  const { data } = await supabase
    .from('post_loves')
    .select('id')
    .eq('post_id', postId)
    .eq('ip_address', ip)
    .maybeSingle()

  return { loved: !!data }
}

export async function getLoveData(postId: string) {
  const [countRes, userLovedRes] = await Promise.all([
    getLoveCount(postId),
    getUserLovedStatus(postId),
  ])

  return {
    count: countRes.count,
    loved: userLovedRes.loved,
  }
}
