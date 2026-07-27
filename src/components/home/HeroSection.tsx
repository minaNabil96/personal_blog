'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  dictionary: {
    hero: {
      title: string
      subtitle: string
    }
    nav: {
      projects: string
      blog: string
    }
  }
}

export default function HeroSection({ dictionary }: HeroSectionProps) {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const isRtl = locale === 'ar'
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-lg text-zinc-400"
        >
          {dictionary.hero.title}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-2 bg-gradient-to-r from-zinc-100 via-white to-zinc-400 bg-clip-text text-5xl font-bold leading-tight text-transparent sm:text-7xl"
        >
          {dictionary.hero.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 max-w-xl text-lg text-zinc-400"
        >
          {dictionary.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href={`/${locale}/projects`}>
            <Button size="lg">
              {dictionary.nav.projects}
              <Arrow size={18} />
            </Button>
          </Link>
          <Link href={`/${locale}/blog`}>
            <Button variant="secondary" size="lg">
              {dictionary.nav.blog}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
