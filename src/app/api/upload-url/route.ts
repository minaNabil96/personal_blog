import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

/**
 * Mints a short-lived URL the browser can upload an image to directly.
 *
 * Sending the file straight to Supabase Storage keeps the bytes off the
 * serverless function. On a slow uplink, proxying even a couple of hundred
 * kilobytes through the app took far longer than the request timeout allowed.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let contentType = ''
    try {
      const body = await request.json()
      contentType = typeof body?.contentType === 'string' ? body.contentType : ''
    } catch {
      // No body is fine; fall back to the default extension below.
    }

    const ext = EXTENSIONS[contentType.toLowerCase()] || 'webp'
    const path = `${randomUUID()}.${ext}`

    const admin = createAdminClient()

    const { data, error } = await admin.storage
      .from('blog-images')
      .createSignedUploadUrl(path)

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Could not prepare upload' },
        { status: 500 },
      )
    }

    const { data: { publicUrl } } = admin.storage.from('blog-images').getPublicUrl(path)

    return NextResponse.json({ path, token: data.token, signedUrl: data.signedUrl, publicUrl })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
