'use client'

import { useEffect, useRef, useState } from 'react'

interface ClampedTextProps {
  children: React.ReactNode
  lines?: number
  className?: string
}

export function ClampedText({ children, lines = 2, className = '' }: ClampedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [displayText, setDisplayText] = useState<string | null>(null)

  // Always clamp via CSS so the text is never shown in full height.
  const clampStyle: React.CSSProperties = {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const text = el.textContent || ''
    const style = getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight) || 22
    const maxHeight = lineHeight * lines

    // Not overflowing -> nothing to truncate
    if (el.scrollHeight <= el.clientHeight + 1) {
      setDisplayText(null)
      return
    }

    // Binary search for the longest prefix that fits in `lines` lines.
    const clone = el.cloneNode(true) as HTMLParagraphElement
    clone.style.position = 'absolute'
    clone.style.visibility = 'hidden'
    clone.style.width = `${el.clientWidth}px`
    clone.style.whiteSpace = 'normal'
    clone.style.wordWrap = 'break-word'
    clone.style.display = 'block'
    clone.style.webkitLineClamp = 'none'
    clone.style.webkitBoxOrient = 'horizontal'
    clone.style.overflow = 'visible'
    document.body.appendChild(clone)

    let low = 0
    let high = text.length
    let best = text

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      clone.textContent = text.slice(0, mid) + '…'
      if (clone.scrollHeight <= maxHeight) {
        best = text.slice(0, mid) + '…'
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    clone.remove()
    setDisplayText(best)
  }, [children, lines])

  return (
    <p ref={ref} className={className} style={clampStyle}>
      {displayText !== null ? displayText : children}
    </p>
  )
}