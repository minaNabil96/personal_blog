'use client'

import { useState } from 'react'
import { ZoomIn, X } from 'lucide-react'

interface ProseImageProps {
  src?: string | Blob
  alt?: string
  title?: string
}

export function ProseImage({ src, alt, title }: ProseImageProps) {
  const [lightbox, setLightbox] = useState(false)

  if (!src) return null

  const srcStr = typeof src === 'string' ? src : ''

  return (
    <>
      <figure className="prose-figure group relative">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={srcStr}
            alt={alt || ''}
            loading="lazy"
            className="w-full cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
            onClick={() => setLightbox(true)}
          />
          <button
            onClick={() => setLightbox(true)}
            className="absolute bottom-3 end-3 rounded-lg bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="View full size"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        {(title || alt) && (
          <figcaption>{title || alt}</figcaption>
        )}
      </figure>

      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 cursor-pointer"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 end-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <img
            src={srcStr}
            alt={alt || ''}
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
