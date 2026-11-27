'use client'

import { useEffect, useState } from 'react'
import { useLinkStatus } from 'next/link'
import ArticleSkeleton from '@/components/blog/ArticleSkeleton'

/**
 * Covers the current page with an article skeleton while a blog card link
 * navigates to the destination article. Rendered inside a <Link>, so it only
 * appears while that link's navigation is pending.
 */
export default function ArticleLinkLoading() {
  const { pending } = useLinkStatus()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!pending) {
      setVisible(false)
      return
    }

    // Only show the overlay when the navigation is actually slow, so quick
    // transitions do not flash a full-screen skeleton.
    const timer = setTimeout(() => setVisible(true), 150)
    return () => clearTimeout(timer)
  }, [pending])

  useEffect(() => {
    if (!visible) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] overflow-y-auto bg-zinc-950 px-4 py-20 sm:px-6 sm:py-24"
    >
      <span className="sr-only">Loading article…</span>
      <ArticleSkeleton />
    </div>
  )
}
