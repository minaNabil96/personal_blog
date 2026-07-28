'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Globe, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { logout } from '@/actions/auth'

const locales = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'ru', label: 'Русский', dir: 'ltr' },
] as const

const navLinks = [
  { label: { en: 'Home', ar: 'الرئيسية', ru: 'Главная' }, href: '' },
  { label: { en: 'Blog', ar: 'المدونة', ru: 'Блог' }, href: 'blog' },
  { label: { en: 'Projects', ar: 'المشاريع', ru: 'Проекты' }, href: 'projects' },
]

export default function Navbar({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'en'
  const [mobileOpen, setMobileOpen] = useState(false)
  const isRtl = locale === 'ar'
  const slideFrom = isRtl ? -100 : 100

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.refresh()
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 w-full bg-zinc-900/95">
      <nav className="flex w-full items-center justify-between border-b border-zinc-800/50 bg-zinc-900/60 backdrop-blur-xl px-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="text-lg font-bold text-zinc-100 hover:text-white transition-colors"
        >
          Mina&apos;s tech
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}/${link.href}`}
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100 hover:bg-zinc-800/50"
            >
              {link.label[locale as keyof typeof link.label] || link.label.en}
            </Link>
          ))}

          <div className="relative">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100 hover:bg-zinc-800/50">
                  <Globe size={16} />
                  <span className="uppercase">{locale}</span>
                  <ChevronDown size={14} />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className={`absolute top-full mt-2 z-50 min-w-[140px] rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl ${isRtl ? 'left-0' : 'right-0'}`}
              >
                {locales.map((l) => (
                  <DropdownMenu.Item asChild key={l.code}>
                    <Link
                      href={`/${l.code}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      {l.label}
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/dashboard`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-zinc-800/50 flex items-center gap-1.5"
              >
                <LayoutDashboard size={16} />
                {locale === 'ar' ? 'لوحة التحكم' : locale === 'ru' ? 'Панель' : 'Dashboard'}
              </Link>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-zinc-800/50 flex items-center gap-1.5"
                >
                  <LogOut size={16} />
                  {locale === 'ar' ? 'تسجيل الخروج' : locale === 'ru' ? 'Выйти' : 'Logout'}
                </button>
              </form>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-300"
            >
              {locale === 'ar' ? 'تسجيل الدخول' : locale === 'ru' ? 'Войти' : 'Login'}
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:text-zinc-100 md:hidden min-h-[44px] min-w-[44px]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: slideFrom, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slideFrom, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed top-16 z-40 w-72 max-w-[85vw] ${isRtl ? 'left-4' : 'right-4'}`}
            >
              <div className="h-full rounded-2xl border border-zinc-800/50 bg-zinc-900/95 p-4 backdrop-blur-xl shadow-xl overflow-y-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${locale}/${link.href}`}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm text-zinc-400 transition-colors hover:text-zinc-100 hover:bg-zinc-800/50"
                  >
                    {link.label[locale as keyof typeof link.label] || link.label.en}
                  </Link>
                ))}
                <hr className="my-2 border-zinc-800" />
                <div className="flex items-center gap-2 px-4 py-3">
                  {locales.map((l) => (
                    <Link
                      key={l.code}
                      href={`/${l.code}`}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        l.code === locale
                          ? 'bg-zinc-800 text-zinc-100'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {l.code.toUpperCase()}
                    </Link>
                  ))}
                </div>
                {isAuthenticated ? (
                  <>
                    <Link
                      href={`/${locale}/dashboard`}
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 block rounded-lg bg-cyan-600 px-4 py-3 text-center text-sm font-medium text-white min-h-[44px] flex items-center justify-center"
                    >
                      {locale === 'ar' ? 'لوحة التحكم' : locale === 'ru' ? 'Панель' : 'Dashboard'}
                    </Link>
                    <form action={handleLogout}>
                      <button
                        type="submit"
                        onClick={() => setMobileOpen(false)}
                        className="mt-2 block w-full rounded-lg border border-red-800/50 px-4 py-3 text-center text-sm font-medium text-red-400 min-h-[44px]"
                      >
                        {locale === 'ar' ? 'تسجيل الخروج' : locale === 'ru' ? 'Выйти' : 'Logout'}
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 block rounded-lg bg-zinc-100 px-4 py-3 text-center text-sm font-medium text-black min-h-[44px] flex items-center justify-center"
                  >
                    {locale === 'ar' ? 'تسجيل الدخول' : locale === 'ru' ? 'Войти' : 'Login'}
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
