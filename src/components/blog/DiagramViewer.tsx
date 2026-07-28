'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { X, Expand, Minus, Plus, RotateCcw } from 'lucide-react'
import { createPortal } from 'react-dom'

interface DiagramViewerProps {
  children: ReactNode
  label?: string
}

export function DiagramViewer({ children, label }: DiagramViewerProps) {
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)

  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    if (!open) {
      resetView()
      return
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, resetView])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(s => Math.max(0.25, Math.min(5, s + delta)))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { ...position }
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPosition({
      x: posStart.current.x + dx,
      y: posStart.current.y + dy,
    })
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  return (
    <>
      <div className="relative group">
        {children}
        <button
          onClick={() => setOpen(true)}
          className="absolute top-2 end-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
          aria-label="Expand diagram"
        >
          <Expand size={14} />
        </button>
      </div>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: dragging ? 'grabbing' : 'default' }}
        >
          <div className="absolute top-4 inset-i-4 md:inset-i-auto md:end-4 flex flex-wrap items-center gap-2 z-10">
            {label && <span className="text-xs text-zinc-500 bg-black/60 px-2 py-1 rounded">{label}</span>}
            <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-1">
              <button
                onClick={resetView}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Reset view"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => setScale(s => Math.max(0.25, s - 0.25))}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Zoom out"
              >
                <Minus size={18} />
              </button>
              <span className="text-xs text-zinc-400 w-10 text-center tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(s => Math.min(5, s + 0.25))}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Zoom in"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 start-1/2 -translate-x-1/2 text-xs text-zinc-500 bg-black/70 px-3 py-1.5 rounded-full pointer-events-none select-none whitespace-nowrap">
            Drag to pan &middot; Scroll to zoom
          </div>

          <div
            ref={contentRef}
            className="w-full h-full flex items-center justify-center p-4 md:p-16"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            style={{ cursor: dragging ? 'grabbing' : 'grab' }}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: dragging ? 'none' : 'transform 0.15s ease-out',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
