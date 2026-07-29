import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already loved
    const { data: existing } = await supabase
      .from('post_loves')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    let loved: boolean

    if (existing) {
      // Unlike
      const { error } = await supabase
        .from('post_loves')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      loved = false
    } else {
      // Like
      const { error } = await supabase
        .from('post_loves')
        .insert({ post_id: postId, user_id: user.id })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      loved = true
    }

    // Get updated count
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