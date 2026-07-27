import Link from 'next/link'
import { GitBranch, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Personal Blog.{' '}
          <span className="text-zinc-600">Built with Next.js &amp; Supabase.</span>
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label="GitHub"
          >
            <GitBranch size={20} />
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label="Twitter"
          >
            <MessageCircle size={20} />
          </Link>
        </div>
      </div>
    </footer>
  )
}
