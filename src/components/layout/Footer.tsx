import Link from 'next/link'
import { Send } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Mina N. F.{' '}
          <span className="text-zinc-600">Built with Next.js &amp; Supabase.</span>
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="https://t.me/minanabil96"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label="Telegram"
          >
            <Send size={20} />
          </Link>
        </div>
      </div>
    </footer>
  )
}
