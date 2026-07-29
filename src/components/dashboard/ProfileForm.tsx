'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, User, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateProfile } from '@/actions/profile'
import { useToast } from '@/components/ui/toast'

interface ProfileData {
  id: string
  username: string
  avatar_url: string | null
}

interface ProfileFormProps {
  locale: string
  profile: ProfileData | null
}

export function ProfileForm({ locale, profile }: ProfileFormProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [username, setUsername] = useState(profile?.username || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      addToast('Image must be under 4MB', 'error')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const data = await res.json()

      if (!res.ok) {
        addToast(data.error || 'Upload failed', 'error')
        return
      }

      if (data.url) {
        setAvatarUrl(data.url)
        addToast('Avatar uploaded', 'success')
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        addToast('Upload timed out. Try a smaller image.', 'error')
      } else {
        addToast('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set('username', username)
      formData.set('avatar_url', avatarUrl)

      const result = await updateProfile(formData)

      if (result && 'error' in result && result.error) {
        addToast(result.error, 'error')
        return
      }

      addToast('Profile updated', 'success')
      router.refresh()
    } catch (err) {
      addToast('Error: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover border-2 border-zinc-700"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="flex cursor-pointer items-center justify-center h-full w-full">
                    <Upload size={20} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center h-24 w-24 rounded-full border-2 border-dashed border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors">
                {uploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-400" />
                ) : (
                  <User size={32} />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Input
              label="Username"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        {avatarUrl && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 truncate flex-1">{avatarUrl}</span>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-800/70 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700/70 transition-colors">
              <Upload size={12} />
              Change
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
            <button
              type="button"
              onClick={() => setAvatarUrl('')}
              className="rounded-lg bg-red-500/80 px-2.5 py-1.5 text-xs text-white hover:bg-red-500 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" size="lg" loading={submitting}>
          <Save size={18} />
          Save Profile
        </Button>
      </div>
    </form>
  )
}
