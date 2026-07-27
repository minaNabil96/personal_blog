'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ExternalLink, GitBranch } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  title: string
  description: string
  cover_image?: string
  tech_stack: string[]
  github_url?: string
  live_url?: string
  tags: string[]
}

interface ProjectsGridProps {
  dictionary: {
    projects: {
      title: string
      subtitle: string
      filter_all: string
      no_projects: string
      view_github: string
      view_demo: string
    }
  }
  projects: Project[]
}

export default function ProjectsGrid({ dictionary, projects }: ProjectsGridProps) {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const allTechs = [...new Set(projects.flatMap((p) => p.tech_stack))]
  const [activeTech, setActiveTech] = useState<string | null>(null)

  const filtered = activeTech
    ? projects.filter((p) => p.tech_stack.includes(activeTech))
    : projects

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-zinc-100">{dictionary.projects.title}</h1>
          <p className="mt-2 text-zinc-400">{dictionary.projects.subtitle}</p>
        </div>

        {allTechs.length > 0 && (
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveTech(null)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                !activeTech
                  ? 'bg-zinc-100 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {dictionary.projects.filter_all}
            </button>
            {allTechs.map((tech) => (
              <button
                key={tech}
                onClick={() => setActiveTech(tech)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  activeTech === tech
                    ? 'bg-zinc-100 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-center text-zinc-500">{dictionary.projects.no_projects}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
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
                    {project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                        >
                          <GitBranch size={16} />
                          {dictionary.projects.view_github}
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                        >
                          <ExternalLink size={16} />
                          {dictionary.projects.view_demo}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
