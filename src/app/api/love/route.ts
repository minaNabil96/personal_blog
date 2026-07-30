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
  if (entry.count >= 10) return false
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

    const { data: existing } = await supabase
      .from('post_loves')
      .select('id')
      .eq('post_id', postId)
      .eq('ip_address', ip)
      .maybeSingle()

    let loved: boolean

    if (existing) {
      const { error } = await supabase
        .from('post_loves')
        .delete()
        .eq('post_id', postId)
        .eq('ip_address', ip)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      loved = false
    } else {
      const { error } = await supabase
        .from('post_loves')
        .insert({ post_id: postId, ip_address: ip })

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Already loved' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      loved = true
    }

    const { count, error: countError } = await supabase
      .from('post_loves')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

    return NextResponse.json({ count: count || 0, loved })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
