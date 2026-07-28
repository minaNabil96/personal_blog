import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.output<typeof LoginFormSchema>;

export const TranslationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  excerpt: z.string().max(500).optional().default(""),
  content: z.string().min(1, "Content is required"),
  slug: z.string().min(1).max(200),
});

export type Translation = z.output<typeof TranslationSchema>;

export const PostSchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  cover_image: z.string().url().optional().nullable().default(null),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().optional().default(false),
  category: z.enum(["technology", "project"]).optional(),
  translations: z.object({
    ar: TranslationSchema,
    en: TranslationSchema,
    ru: TranslationSchema,
  }),
});

export type PostFormValues = z.output<typeof PostSchema>;

export const ProjectMetaSchema = z.object({
  repo_url: z.string().url("Invalid repository URL").optional().nullable(),
  live_url: z.string().url("Invalid live URL").optional().nullable(),
  tech_stack: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
});

export type ProjectMetaValues = z.output<typeof ProjectMetaSchema>;