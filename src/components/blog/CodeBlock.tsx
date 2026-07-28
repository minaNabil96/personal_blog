'use client'

import { useState, useCallback } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  className?: string
  children?: string
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const lang = className?.replace(/^language-/, '') || ''

  const handleCopy = useCallback(async () => {
    if (!children) return
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [children])

  const lines = (children || '').split('\n')
  const showLineNumbers = lines.length > 1

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
          <table className="border-none bg-transparent m-0 p-0 w-auto">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="border-none bg-transparent">
                  <td className="border-none text-zinc-600 text-right select-none px-4 py-0 text-xs align-top">
                    {i + 1}
                  </td>
                  <td className="border-none p-0 whitespace-pre">
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <code className={className}>{children}</code>
        )}
      </div>
    </div>
  )
}
