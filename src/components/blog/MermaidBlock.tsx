'use client'

import { useEffect, useRef, useState } from 'react'

interface MermaidBlockProps {
  chart: string
}

export function MermaidBlock({ chart }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const renderedRef = useRef(false)

  useEffect(() => {
    if (renderedRef.current) return
    renderedRef.current = true

    let cancelled = false

    async function render() {
      try {
        const { default: mermaid } = await import('mermaid')

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          fontFamily: 'Tajawal, sans-serif',
          securityLevel: 'loose',
          themeVariables: {
            primaryColor: '#1e293b',
            primaryTextColor: '#e2e8f0',
            primaryBorderColor: '#334155',
            lineColor: '#64748b',
            secondaryColor: '#0f172a',
            tertiaryColor: '#1e293b',
            background: '#09090b',
          },
        })

        if (cancelled || !containerRef.current) return

        const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`
        containerRef.current.innerHTML = ''

        const { svg } = await mermaid.render(id, chart)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart])

  if (error) {
    return (
      <div className="mermaid-wrapper text-red-400 text-sm">
        Failed to render diagram
      </div>
    )
  }

  return (
    <div className="mermaid-wrapper">
      {loading && (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-400" />
          Rendering diagram...
        </div>
      )}
      <div ref={containerRef} className={loading ? 'hidden' : ''} />
    </div>
  )
}
