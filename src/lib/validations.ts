import { z } from 'zod';

export const applicationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  companyId: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  status: z.enum(['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED']).default('SAVED'),
  appliedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const resumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Resume content is required'),
  isDefault: z.boolean().default(false),
});

export const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  applicationId: z.string().optional(),
});

export const aiInsightSchema = z.object({
  resumeId: z.string().min(1, 'Resume is required'),
  matchScore: z.number().int().min(0).max(100),
  summary: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  gaps: z.array(z.string()).optional(),
  suggestions: z.array(z.string()).optional(),
});
