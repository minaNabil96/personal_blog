'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, ArrowLeft, ExternalLink, GitBranch } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  title: string
  description: string
  cover_image?: string
  tags: string[]
  github_url?: string
  live_url?: string
}

interface FeaturedProjectsProps {
  dictionary: {
    featured: { title: string; view_all: string }
  }
  projects: Project[]
}

export default function FeaturedProjects({ dictionary, projects }: FeaturedProjectsProps) {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const isRtl = locale === 'ar'
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  if (!projects.length) return null

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-zinc-100" data-aos="fade-up">
              {dictionary.featured.title}
            </h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600" data-aos="fade-up" data-aos-delay="100" />
          </div>
          <Link href={`/${locale}/projects`}>
            <Button variant="ghost" size="sm">
              {dictionary.featured.view_all}
              <Arrow size={16} />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {projects.slice(0, 3).map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card glass className="group h-full transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl">
                {project.cover_image && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={project.cover_image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardContent className="flex flex-col gap-3">
                  <h3 className="text-lg font-semibold text-zinc-100">{project.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400 line-clamp-3">
                    {project.description}
                  </p>
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 transition-colors hover:text-zinc-300"
                      >
                        <GitBranch size={18} />
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 transition-colors hover:text-zinc-300"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
