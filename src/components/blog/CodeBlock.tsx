'use client'

import { useState, useCallback, useMemo } from 'react'
import { Check, Copy } from 'lucide-react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface CodeBlockProps {
  className?: string
  children?: string
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const lang = className?.replace(/^language-/, '') || ''

  const highlighted = useMemo(() => {
    if (!children) return ''
    try {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(children, { language: lang }).value
      }
      return hljs.highlightAuto(children).value
    } catch {
      return children
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }
  }, [children, lang])

  const lines = useMemo(() => {
    const parts = highlighted.split('\n')
    if (parts.length > 1 && parts[parts.length - 1] === '') parts.pop()
    return parts
  }, [highlighted])

  const showLineNumbers = lines.length > 1

  const handleCopy = useCallback(async () => {
    if (!children) return
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [children])

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className={`copy-button ${copied ? 'copied' : ''}`}
        >
          {copied ? (
            <><Check size={14} /> Copied</>
          ) : (
            <><Copy size={14} /> Copy</>
          )}
        </button>
      </div>
      <div className="code-block-content">
        {showLineNumbers ? (
          <table>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i}>
                  <td className="code-line-number">{i + 1}</td>
                  <td className="code-line-code" dangerouslySetInnerHTML={{ __html: line || ' ' }} />
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="hljs" dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
        )}
      </div>
    </div>
  )
}
