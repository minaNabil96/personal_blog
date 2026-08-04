'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Languages, Briefcase, GraduationCap, Cpu, Server, Code2, GitBranch } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface AboutDictionary {
  about: {
    title: string
    name: string
    role: string
    location: string
    phone: string
    email: string
    nationality: string
    languages: string
    summary: string
    experienceTitle: string
    experienceRole: string
    experienceCompany: string
    experiencePeriod: string
    experienceLocation: string
    experience1: string
    experience2: string
    experience3: string
    experience4: string
    educationTitle: string
    education1: string
    education2: string
    techStack: string
    skillAI: string
    skillBackend: string
    skillFrontend: string
    skillInfra: string
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const skillVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function AboutSection({ dictionary }: { dictionary: AboutDictionary }) {
  const t = dictionary.about

  const skills = [
    { label: t.skillAI, icon: Cpu },
    { label: t.skillBackend, icon: Server },
    { label: t.skillFrontend, icon: Code2 },
    { label: t.skillInfra, icon: GitBranch },
  ]

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center text-4xl font-bold text-zinc-100"
        >
          {t.title}
        </motion.h1>

        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <Card glass>
            <CardContent className="p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-bold text-zinc-100">{t.name}</h2>
                  <p className="mb-4 text-lg font-semibold text-cyan-400">{t.role}</p>
                  <div className="flex flex-col gap-2 text-sm text-zinc-400">
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-400" /> {t.location}</span>
                    <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan-400" /> {t.phone}</span>
                    <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-cyan-400" /> {t.email}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm text-zinc-400 md:text-right">
                  <span className="flex items-center gap-2 md:justify-end"><Languages className="h-4 w-4 text-cyan-400" /> {t.languages}</span>
                  <span className="text-zinc-300"><span className="text-zinc-500">Nationality:</span> {t.nationality}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <p className="text-lg leading-relaxed text-zinc-400">{t.summary}</p>
        </motion.div>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h3 className="mb-8 flex items-center gap-3 text-xl font-bold uppercase tracking-widest text-zinc-100">
            <Briefcase className="h-5 w-5 text-cyan-400" />
            {t.experienceTitle}
          </h3>

          <Card glass>
            <CardContent className="relative p-8">
              <div className="absolute bottom-0 left-8 top-0 w-px bg-gradient-to-b from-cyan-400/30 via-cyan-400/10 to-transparent" />
              <div className="relative pl-10">
                <div className="absolute left-[22px] top-1 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <h4 className="mb-1 text-lg font-bold text-zinc-100">{t.experienceRole}</h4>
                <p className="mb-1 text-sm font-medium text-cyan-400/80">{t.experienceCompany}</p>
                <p className="mb-4 flex items-center gap-4 text-xs text-zinc-500">
                  <span>{t.experiencePeriod}</span>
                  <span>|</span>
                  <span>{t.experienceLocation}</span>
                </p>
                <ul className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="border-l border-zinc-800 pl-4 text-sm leading-relaxed text-zinc-400">
                      {t[`experience${i}` as keyof typeof t] as string}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h3 className="mb-8 flex items-center gap-3 text-xl font-bold uppercase tracking-widest text-zinc-100">
            <GraduationCap className="h-5 w-5 text-cyan-400" />
            {t.educationTitle}
          </h3>

          <div className="space-y-4">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card glass>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/20">
                      <GraduationCap className="h-5 w-5 text-cyan-400" />
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {t[`education${i}` as keyof typeof t] as string}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h3 className="mb-8 flex items-center gap-3 text-xl font-bold uppercase tracking-widest text-zinc-100">
            {t.techStack}
          </h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {skills.map((skill) => {
              const Icon = skill.icon
              return (
                <motion.div
                  key={skill.label}
                  variants={skillVariants}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="group flex cursor-default items-center gap-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-5 backdrop-blur-xl transition-colors hover:border-zinc-700"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/20 transition-all group-hover:bg-cyan-400/30">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="text-sm leading-relaxed text-zinc-400">{skill.label}</span>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}