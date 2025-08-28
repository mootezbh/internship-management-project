import { z } from 'zod';

export const CVSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(
    z.object({
      job_title: z.string(),
      company: z.string(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      description: z.string().optional(),
    })
  ).default([]),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    })
  ).default([]),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      technologies: z.array(z.string()).default([]),
      link: z.string().optional(),
    })
  ).default([]),
});
