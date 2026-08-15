import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const rateLimit = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 30) return false
  entry.count++
  return true
}

function getIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIp(request)
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('post_views')
      .insert({ post_id: postId, ip_address: ip })

    if (error) {
      if (error.code === '23505') {
        const { count } = await supabase
          .from('post_views')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId)

        return NextResponse.json({ count: count || 0, counted: false })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { count, error: countError } = await supabase
      .from('post_views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

    return NextResponse.json({ count: count || 0, counted: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}