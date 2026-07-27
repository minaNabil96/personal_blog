'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, LayoutDashboard, FileText, Plus, Settings, LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/actions/auth'

const NAV_ITEMS = [
  { href: '/dashboard', label: { ar: 'لوحة التحكم', en: 'Dashboard', ru: 'Панель' }, icon: LayoutDashboard },
  { href: '/dashboard/posts', label: { ar: 'المقالات', en: 'Posts', ru: 'Статьи' }, icon: FileText },
  { href: '/dashboard/posts/new', label: { ar: 'مقال جديد', en: 'New Post', ru: 'Новая статья' }, icon: Plus },
  { href: '/dashboard/settings', label: { ar: 'الإعدادات', en: 'Settings', ru: 'Настройки' }, icon: Settings },
]

function getPageTitle(pathname: string, locale: string) {
  const item = NAV_ITEMS.find(i => pathname === `/${locale}${i.href}` || (i.href !== '/dashboard' && pathname.startsWith(`/${locale}${i.href}`)))
  if (!item) return 'Dashboard'
  const label = item.label[locale as keyof typeof item.label]
  return label || 'Dashboard'
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const locale = (params.locale as string) || 'en'
  const isRTL = locale === 'ar'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: isRTL ? '100%' : '-100%' }}
        animate={{ x: sidebarOpen || collapsed ? 0 : isRTL ? '100%' : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col border-r border-zinc-800/50 bg-zinc-900/95 backdrop-blur-xl transition-all duration-300 lg:relative lg:translate-x-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800/50 px-4">
          {!collapsed && (
            <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-1.5">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-zinc-100">Admin</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'rounded-lg p-2 text-zinc-400 transition-colors hover:text-zinc-100 hover:bg-zinc-800/50',
              collapsed && 'mx-auto'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isRTL ? (
              collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
            ) : (
              collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === `/${locale}${item.href}` ||
              (item.href !== '/dashboard' && pathname.startsWith(`/${locale}${item.href}`))
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-zinc-800/50 text-cyan-400'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                )}
                title={collapsed ? item.label[locale as keyof typeof item.label] : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                {!collapsed && <span>{item.label[locale as keyof typeof item.label]}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-zinc-800/50 p-4">
          <form action={logout} className="w-full">
            <button
              type="submit"
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:text-red-400 hover:bg-zinc-800/50',
                collapsed && 'justify-center'
              )}
            >
              <LogOut size={20} aria-hidden="true" />
              {!collapsed && <span>{locale === 'ar' ? 'تسجيل الخروج' : locale === 'ru' ? 'Выйти' : 'Logout'}</span>}
            </button>
          </form>
        </div>
      </motion.aside>

      <div className="flex flex-1 flex-col min-w-0 lg:pl-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-800/50 bg-zinc-900/80 px-6 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg p-2 text-zinc-400 transition-colors hover:text-zinc-100 hover:bg-zinc-800/50"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="flex-1 text-lg font-semibold text-zinc-100">
            {getPageTitle(pathname, locale)}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}