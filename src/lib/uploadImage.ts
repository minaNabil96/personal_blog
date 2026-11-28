interface UploadOptions {
  signal?: AbortSignal
}

interface SignedUpload {
  signedUrl: string
  publicUrl: string
}

async function requestSignedUrl(
  contentType: string,
  signal?: AbortSignal,
): Promise<SignedUpload | null> {
  try {
    const res = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contentType }),
      signal,
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.signedUrl || !data?.publicUrl) return null
    return { signedUrl: data.signedUrl, publicUrl: data.publicUrl }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    return null
  }
}

async function uploadThroughApp(file: File, signal?: AbortSignal): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload', { method: 'POST', body: formData, signal })
  const data = await res.json().catch(() => ({}))

  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Upload failed')
  }

  return data.url
}

/**
 * Uploads an image for the blog.
 *
 * Tries a direct browser → Supabase Storage upload first (fast, the bytes never
 * touch Vercel), then falls back to the multipart API route so uploads still
 * work if direct uploads are unavailable.
 */
export async function uploadImage(file: File, { signal }: UploadOptions = {}): Promise<string> {
  const signed = await requestSignedUrl(file.type, signal)

  if (signed) {
    try {
      const res = await fetch(signed.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'content-type': file.type || 'application/octet-stream',
          'cache-control': 'max-age=31536000',
        },
        signal,
      })

      if (res.ok) return signed.publicUrl
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      // Fall through to the app route below.
    }
  }

  return uploadThroughApp(file, signal)
}
