'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ArrowRight, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  dictionary: {
    hero: {
      title: string
      subtitle: string
      role: string
      view_projects: string
      get_in_touch: string
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src="/mina.jpg"
              alt={dictionary.hero.title}
              width={160}
              height={160}
              priority
              className="h-40 w-40 rounded-full border-2 border-zinc-700 object-cover shadow-2xl"
            />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-zinc-100 via-white to-zinc-400 bg-clip-text text-5xl font-bold leading-tight text-transparent sm:text-7xl"
        >
          {dictionary.hero.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-3 text-xl font-semibold text-cyan-400"
        >
          {dictionary.hero.role}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400"
        >
          {dictionary.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href={`/${locale}/projects`}>
            <Button size="lg">
              {dictionary.hero.view_projects}
              <Arrow size={18} />
            </Button>
          </Link>
          <a href="mailto:minanabil96@yandex.com">
            <Button variant="secondary" size="lg">
              <Mail size={18} />
              {dictionary.hero.get_in_touch}
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  )
}