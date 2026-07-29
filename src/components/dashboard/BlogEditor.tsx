'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import type { Schema } from 'hast-util-sanitize'

const sanitizeSchema: Schema = {
  attributes: {
    '*': ['className'],
    div: ['className', 'itemScope', 'itemType'],
    span: ['className'],
    img: ['className', 'loading', 'ariaDescribedBy', 'ariaLabel', 'ariaLabelledBy', 'longDesc', 'src'],
    code: [['className', /^language-|hljs/]],
  },
  strip: ['script'],
}
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  Code, TextQuote, List, ListOrdered, Table2, Image,
  BetweenHorizonalEnd, Braces, Workflow, AlertTriangle,
  Eye, EyeOff, SplitSquareHorizontal, Save,
} from 'lucide-react'
import { CodeBlock } from '@/components/blog/CodeBlock'
import { DiagramBlock } from '@/components/blog/DiagramBlock'
import { ProseImage } from '@/components/blog/ProseImage'
import type { Components } from 'react-markdown'

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'bash',
  'sql', 'json', 'yaml', 'html', 'css', 'jsx', 'tsx',
]

const MERMAID_TEMPLATES: Record<string, string> = {
  flowchart: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]`,
  sequence: `sequenceDiagram
    participant A
    participant B
    A->>B: Message
    B-->>A: Response`,
  'class diagram': `classDiagram
    class Animal {
      +name: string
      +speak() void
    }
    class Dog {
      +breed: string
    }
    Animal <|-- Dog`,
}

const CALLOUT_TYPES = ['info', 'warning', 'success', 'danger']

const SYNTAX_CHEATSHEET = [
  { label: 'Bold', syntax: '**bold**', shortcut: '⌘B' },
  { label: 'Italic', syntax: '*italic*', shortcut: '⌘I' },
  { label: 'Strikethrough', syntax: '~~text~~' },
  { label: 'Link', syntax: '[text](url)', shortcut: '⌘K' },
  { label: 'Image', syntax: '![alt](url)' },
  { label: 'Code Block', syntax: '```lang\\ncode\\n```' },
  { label: 'Mermaid', syntax: '```mermaid\\n...\\n```' },
  { label: 'Callout', syntax: ':::info\\n...\\n:::' },
  { label: 'Table', syntax: '\\| H1 \\| H2 \\|\n\\| --- \\| --- \\|' },
  { label: 'Heading', syntax: '# H1 to ###### H6' },
  { label: 'Quote', syntax: '> quote' },
  { label: 'Bullet List', syntax: '- item' },
  { label: 'Numbered List', syntax: '1. item' },
  { label: 'HR', syntax: '---' },
]

type ViewMode = 'edit' | 'preview' | 'split'

const previewComponents: Partial<Components> = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const lang = match?.[1]
    const code = String(children)
    if (!match && !className) return <code className={className} {...props}>{children}</code>
    if (lang === 'mermaid' || lang === 'dot' || lang === 'graphviz' || lang === 'plantuml' || lang === 'puml') {
      return <DiagramBlock lang={lang!} code={code} />
    }
    return <CodeBlock className={className}>{code}</CodeBlock>
  },
  pre({ children }) { return <>{children}</> },
  img({ src, alt, title }) { return <ProseImage src={src} alt={alt} title={title} /> },
}

interface BlogEditorProps {
  value: string
  onChange: (value: string) => void
  locale: string
  draftKey: string
}

export function BlogEditor({ value, onChange, locale, draftKey }: BlogEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [showDialogs, setShowDialogs] = useState<string | null>(null)
  const [showCheatsheet, setShowCheatsheet] = useState(false)
  const [saved, setSaved] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const saved = localStorage.getItem(`draft:${draftKey}`)
    if (saved && saved !== value && !value) {
      onChange(saved)
    }
  }, [])

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      localStorage.setItem(`draft:${draftKey}`, value)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 1500)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [value, draftKey])

  const insertAtCursor = useCallback((before: string, after = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.substring(start, end)
    const newText = value.substring(0, start) + before + selected + after + value.substring(end)
    onChange(newText)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }, [value, onChange])

  const insertBlock = useCallback((template: string, placeholder?: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const afterCursor = value.substring(ta.selectionStart)
    const prefix = value.substring(0, start)
    const needsLeading = prefix.length > 0 && !prefix.endsWith('\n')
    onChange(value.substring(0, start) + (needsLeading ? '\n' : '') + template + (afterCursor ? '\n\n' : '\n') + afterCursor)
    requestAnimationFrame(() => { ta.focus() })
  }, [value, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    if (!mod) return
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.substring(start, end)

    switch (e.key) {
      case 'b': e.preventDefault(); insertAtCursor('**', '**'); break
      case 'i': e.preventDefault(); insertAtCursor('*', '*'); break
      case 'k': e.preventDefault(); insertAtCursor('[', '](url)'); break
      case 'd': e.preventDefault(); insertAtCursor('~~', '~~'); break
      case '`': e.preventDefault()
        if (selected) insertAtCursor('`', '`')
        else insertBlock('```\n\n```')
        break
    }
  }, [value, insertAtCursor, insertBlock])

  const renderPreview = () => (
    <div className="prose prose-invert max-w-none leading-loose p-6 overflow-y-auto max-h-[70vh]">
      <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]} remarkPlugins={[remarkGfm]} components={previewComponents}>
        {value || '*Start writing to see the preview...*'}
      </ReactMarkdown>
    </div>
  )

  const toolbarBtn = (label: string, onClick: () => void, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100 hover:bg-zinc-800/50"
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  const separator = <div className="w-px h-5 bg-zinc-800 mx-1 shrink-0" />

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-zinc-800/50 bg-zinc-950/50">
        {toolbarBtn('Bold', () => insertAtCursor('**', '**'), <Bold size={14} />)}
        {toolbarBtn('Italic', () => insertAtCursor('*', '*'), <Italic size={14} />)}
        {toolbarBtn('Strike', () => insertAtCursor('~~', '~~'), <Strikethrough size={14} />)}
        {separator}
        {toolbarBtn('H1', () => insertAtCursor('# ', ''), <Heading1 size={14} />)}
        {toolbarBtn('H2', () => insertAtCursor('## ', ''), <Heading2 size={14} />)}
        {toolbarBtn('H3', () => insertAtCursor('### ', ''), <Heading3 size={14} />)}
        {separator}
        {toolbarBtn('Code', () => setShowDialogs('code'), <Code size={14} />)}
        {toolbarBtn('Mermaid', () => setShowDialogs('mermaid'), <Workflow size={14} />)}
        {toolbarBtn('Callout', () => setShowDialogs('callout'), <AlertTriangle size={14} />)}
        {toolbarBtn('Table', () => insertBlock('| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |'), <Table2 size={14} />)}
        {toolbarBtn('Image', () => setShowDialogs('image'), <Image size={14} />)}
        {separator}
        {toolbarBtn('Quote', () => insertAtCursor('> ', ''), <TextQuote size={14} />)}
        {toolbarBtn('List', () => insertAtCursor('- ', ''), <List size={14} />)}
        {toolbarBtn('Numbered', () => insertAtCursor('1. ', ''), <ListOrdered size={14} />)}
        {toolbarBtn('HR', () => insertBlock('\n---\n'), <BetweenHorizonalEnd size={14} />)}
        {separator}
        {toolbarBtn('Cheatsheet', () => setShowCheatsheet(!showCheatsheet), <Braces size={14} />)}

        <div className="ms-auto flex items-center gap-1">
          {saved && <span className="text-[10px] text-green-500 flex items-center gap-1 px-2"><Save size={10} />Saved</span>}
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`rounded-lg p-1.5 transition-colors ${viewMode === 'edit' ? 'bg-cyan-600/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Edit only"
          >
            <EyeOff size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`rounded-lg p-1.5 transition-colors ${viewMode === 'split' ? 'bg-cyan-600/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Split view"
          >
            <SplitSquareHorizontal size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`rounded-lg p-1.5 transition-colors ${viewMode === 'preview' ? 'bg-cyan-600/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Preview only"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Cheatsheet */}
      {showCheatsheet && (
        <div className="border-b border-zinc-800/50 bg-zinc-950/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Markdown Cheatsheet</span>
            <button type="button" onClick={() => setShowCheatsheet(false)} className="text-xs text-zinc-600 hover:text-zinc-400">Close</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[40vh] overflow-y-auto">
            {SYNTAX_CHEATSHEET.map(item => (
              <div key={item.label} className="rounded-lg bg-zinc-900/60 px-3 py-1.5 text-xs">
                <span className="text-zinc-300 font-medium">{item.label}</span>
                <code className="block text-zinc-500 mt-0.5 font-mono text-[10px]">{item.syntax}</code>
                {item.shortcut && <span className="text-zinc-600 text-[10px]">{item.shortcut}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {showDialogs === 'code' && (
        <Dialog onClose={() => setShowDialogs(null)} title="Insert Code Block">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => { insertBlock(`\`\`\`${lang}\n\n\`\`\``); setShowDialogs(null) }}
                className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50 capitalize"
              >
                {lang}
              </button>
            ))}
          </div>
        </Dialog>
      )}

      {showDialogs === 'mermaid' && (
        <Dialog onClose={() => setShowDialogs(null)} title="Insert Mermaid Diagram">
          <p className="text-xs text-zinc-500 mb-3">Choose a diagram type to insert a template:</p>
          <div className="grid gap-2">
            {Object.entries(MERMAID_TEMPLATES).map(([type, template]) => (
              <button
                key={type}
                type="button"
                onClick={() => { insertBlock(`\`\`\`mermaid\n${template}\n\`\`\``); setShowDialogs(null) }}
                className="rounded-lg border border-zinc-800 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50"
              >
                <span className="font-medium capitalize block mb-1">{type}</span>
                <code className="text-[10px] text-zinc-500 font-mono block truncate">{template.split('\n')[0]}...</code>
              </button>
            ))}
          </div>
        </Dialog>
      )}

      {showDialogs === 'callout' && (
        <Dialog onClose={() => setShowDialogs(null)} title="Insert Callout Box">
          <p className="text-xs text-zinc-500 mb-3">Choose a callout type:</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CALLOUT_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  insertBlock(`<div class="callout callout-${type}">\n**${type.charAt(0).toUpperCase() + type.slice(1)}:** Your message here\n</div>`)
                  setShowDialogs(null)
                }}
                className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:bg-zinc-800/50 callout-${type} callout`}
              >
                <span className="font-medium capitalize">{type}</span>
              </button>
            ))}
          </div>
        </Dialog>
      )}

      {showDialogs === 'image' && (
        <Dialog onClose={() => setShowDialogs(null)} title="Insert Image">
          <p className="text-xs text-zinc-500 mb-3">Enter the image URL:</p>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none mb-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const url = (e.target as HTMLInputElement).value.trim()
                if (url) {
                  insertBlock(`![Image description](${url} "Optional caption")`)
                  setShowDialogs(null)
                }
              }
            }}
          />
          <p className="text-[10px] text-zinc-600">Press Enter to insert</p>
        </Dialog>
      )}

      {/* Editor + Preview */}
      {viewMode === 'edit' && (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your content in Markdown..."
          className="w-full bg-transparent px-5 py-4 text-sm text-zinc-100 placeholder-zinc-600 font-mono leading-relaxed resize-y min-h-[400px] focus:outline-none"
          spellCheck
        />
      )}

      {viewMode === 'split' && (
        <div className="flex flex-col md:flex-row">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your content in Markdown..."
            className="w-full md:w-1/2 bg-transparent px-5 py-4 text-sm text-zinc-100 placeholder-zinc-600 font-mono leading-relaxed resize-none min-h-[400px] focus:outline-none border-b md:border-b-0 md:border-e border-zinc-800/50"
            spellCheck
          />
          <div className="w-full md:w-1/2 max-h-[70vh] overflow-y-auto">
            {renderPreview()}
          </div>
        </div>
      )}

      {viewMode === 'preview' && renderPreview()}

      <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-800/50 bg-zinc-950/30">
        <span className="text-[10px] text-zinc-600">
          {value.length} chars
        </span>
        <span className="text-[10px] text-zinc-600 font-mono">
          {value.split('\n').length} lines
        </span>
      </div>
    </div>
  )
}

function Dialog({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="border-b border-zinc-800/50 p-4 max-h-[50vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-200">{title}</span>
        <button type="button" onClick={onClose} className="text-xs text-zinc-600 hover:text-zinc-400">Cancel</button>
      </div>
      {children}
    </div>
  )
}
