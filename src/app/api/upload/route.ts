import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 400 })
    }

    const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'] as const
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer.slice(0, 12))
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ')

    const MAGIC: Record<string, string[]> = {
      png: ['89 50 4e 47'],
      jpg: ['ff d8 ff'],
      jpeg: ['ff d8 ff'],
      gif: ['47 49 46 38'],
      webp: ['52 49 46 46'],
      avif: ['00 00 00 20 66 74 79 70'],
    }

    const magic = MAGIC[ext]
    if (!magic || !magic.some(p => hex.startsWith(p))) {
      return NextResponse.json({ error: 'File content does not match extension' }, { status: 400 })
    }

    const fileName = `${randomUUID()}.${ext}`

    const admin = createAdminClient()
    const { data, error } = await admin.storage
      .from('blog-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage
      .from('blog-images')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}