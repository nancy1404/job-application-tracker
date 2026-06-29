import { ApplicationStatus, ReminderStatus } from '@prisma/client';
import { z } from 'zod';

const optionalEmptyString = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
}, z.string().trim().min(1).optional());

const optionalUrlString = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
}, z.string().trim().url().optional());

const optionalDateInput = z.preprocess((value) => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }

  return value;
}, z.union([z.string().datetime(), z.date()]).optional());

export const createApplicationSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  companyId: optionalEmptyString,
  jobUrl: optionalUrlString,
  description: z.string().trim().optional(),
  status: z.nativeEnum(ApplicationStatus).default(ApplicationStatus.SAVED),
  appliedDate: optionalDateInput,
  notes: z.string().trim().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const createResumeSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').default('Untitled Resume'),
  content: z.string().trim().min(1, 'Resume content is required'),
  isDefault: z.boolean().default(false),
});

export const updateResumeSchema = createResumeSchema.partial();

export const createCompanySchema = z.object({
  name: z.string().trim().min(1, 'Company name is required'),
  website: optionalUrlString,
  location: z.string().trim().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createReminderSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  dueDate: z.union([z.string().datetime(), z.date()]),
  status: z.nativeEnum(ReminderStatus).default(ReminderStatus.PENDING),
  notes: z.string().trim().optional(),
  applicationId: optionalEmptyString,
});

export const updateReminderSchema = createReminderSchema.partial();

export const createAiInsightRequestSchema = z.object({
  resumeId: z.string().trim().min(1, 'Resume is required'),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type CreateAiInsightRequestInput = z.infer<typeof createAiInsightRequestSchema>;
