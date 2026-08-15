'use client'

import { useEffect, useRef, useState } from 'react'

interface ClampedTextProps {
  children: React.ReactNode
  lines?: number
  className?: string
}

export function ClampedText({ children, lines = 2, className = '' }: ClampedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [isClamped, setIsClamped] = useState(false)
  const [displayText, setDisplayText] = useState<string | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const text = el.textContent || ''
    const style = getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight)
    const maxHeight = lineHeight * lines

    const checkClamp = () => {
      if (el.scrollHeight > el.clientHeight + 1) {
        setIsClamped(true)
        // Binary search for max chars that fit within maxHeight
        let low = 0
        let high = text.length
        let best = text

        const clone = el.cloneNode(true) as HTMLParagraphElement
        clone.style.position = 'absolute'
        clone.style.visibility = 'hidden'
        clone.style.width = `${el.clientWidth}px`
        // Keep normal wrapping - don't use nowrap
        clone.style.whiteSpace = 'normal'
        clone.style.wordWrap = 'break-word'
        clone.style.overflow = 'hidden'
        document.body.appendChild(clone)

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
      } else {
        setIsClamped(false)
        setDisplayText(null)
      }
    }

    checkClamp()
    const ro = new ResizeObserver(checkClamp)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children, lines])

  return (
    <p
      ref={ref}
      className={className}
      style={{ display: isClamped ? '-webkit-box' : undefined }}
    >
      {displayText !== null ? displayText : children}
    </p>
  )
}