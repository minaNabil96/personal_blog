'use client'

import { useEffect, useRef, useState } from 'react'
import { DiagramViewer } from '@/components/blog/DiagramViewer'

type DiagramType = 'mermaid' | 'graphviz' | 'plantuml'

function detectType(lang: string): DiagramType {
  switch (lang) {
    case 'dot':
    case 'graphviz':
      return 'graphviz'
    case 'plantuml':
    case 'puml':
      return 'plantuml'
    default:
      return 'mermaid'
  }
}

function MermaidRenderer({ code, onRender }: { code: string; onRender: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
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

        const { svg } = await mermaid.render(id, code)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          onRender()
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }

    render()
    return () => { cancelled = true }
  }, [code, onRender])

  if (error) {
    return <div className="text-red-400 text-sm">Failed to render Mermaid diagram</div>
  }

  return <div ref={containerRef} />
}

function GraphvizRenderer({ code, onRender }: { code: string; onRender: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const renderedRef = useRef(false)

  useEffect(() => {
    if (renderedRef.current) return
    renderedRef.current = true

    let cancelled = false

    async function render() {
      try {
        const viz = await import('@viz-js/viz')
        const instance = await viz.instance()
        const svg = instance.renderSVGElement(code)
        
        if (cancelled || !containerRef.current) return

        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(svg)
        onRender()
      } catch {
        if (!cancelled) setError(true)
      }
    }

    render()
    return () => { cancelled = true }
  }, [code, onRender])

  if (error) {
    return <div className="text-red-400 text-sm">Failed to render Graphviz diagram</div>
  }

  return <div ref={containerRef} />
}

function PlantUmlRenderer({ code, onRender }: { code: string; onRender: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const renderedRef = useRef(false)

  useEffect(() => {
    if (renderedRef.current) return
    renderedRef.current = true

    let cancelled = false

    async function render() {
      try {
        const encode = await import('plantuml-encoder')
        const encoded = encode.default.encode(code)
        const url = `https://www.plantuml.com/plantuml/svg/${encoded}`

        if (cancelled || !containerRef.current) return

        const res = await fetch(url)
        if (!res.ok) throw new Error('PlantUML server error')

        const svgText = await res.text()
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svgText
          onRender()
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }

    render()
    return () => { cancelled = true }
  }, [code, onRender])

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        Failed to render PlantUML diagram.{' '}
        <a
          href={`https://www.plantuml.com/plantuml/uml/${encodeURIComponent(btoa(code))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Open in PlantUML
        </a>
      </div>
    )
  }

  return <div ref={containerRef} />
}

interface DiagramBlockProps {
  lang: string
  code: string
}

export function DiagramBlock({ lang, code }: DiagramBlockProps) {
  const [rendered, setRendered] = useState(false)
  const type = detectType(lang)
  const label = type === 'mermaid' ? 'Mermaid' : type === 'graphviz' ? 'Graphviz' : 'PlantUML'

  const handleRender = () => setRendered(true)

  return (
    <DiagramViewer label={label}>
      <div className="mermaid-wrapper min-h-[150px]">
        {!rendered && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-400" />
            Rendering {label} diagram...
          </div>
        )}
        {type === 'mermaid' && <MermaidRenderer code={code} onRender={handleRender} />}
        {type === 'graphviz' && <GraphvizRenderer code={code} onRender={handleRender} />}
        {type === 'plantuml' && <PlantUmlRenderer code={code} onRender={handleRender} />}
      </div>
    </DiagramViewer>
  )
}
