import { ApplicationStatus, OpportunityOutcome, OpportunityType, ReminderStatus, WeeklyGoalType } from '@prisma/client';
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

const optionalEmailString = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
}, z.string().trim().email().optional());

const optionalDateInput = z.preprocess((value) => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }

  return value;
}, z.union([z.string().datetime(), z.date()]).optional());

export const createApplicationSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  companyId: optionalEmptyString,
  usedResumeId: optionalEmptyString,
  jobUrl: optionalUrlString,
  description: z.string().trim().optional(),
  status: z.nativeEnum(ApplicationStatus).default(ApplicationStatus.SAVED),
  opportunityType: z.nativeEnum(OpportunityType).default(OpportunityType.JOB),
  contactName: z.string().trim().optional(),
  contactEmail: optionalEmailString,
  outcome: z.nativeEnum(OpportunityOutcome).default(OpportunityOutcome.ACTIVE),
  outcomeDate: optionalDateInput,
  outcomeNotes: z.string().trim().optional(),
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

export const weeklyGoalInputSchema = z.object({
  goalType: z.nativeEnum(WeeklyGoalType),
  targetCount: z.coerce.number().int().min(1, 'Target count must be at least 1').max(99, 'Target count must be 99 or less'),
});

export const weeklyGoalsUpsertSchema = z
  .object({
    weekStartDate: z.coerce.date(),
    goals: z.array(weeklyGoalInputSchema).min(1, 'At least one goal is required').max(3, 'No more than 3 goals are allowed'),
  })
  .superRefine((value, context) => {
    const seenGoalTypes = new Set<WeeklyGoalType>();

    value.goals.forEach((goal, index) => {
      if (seenGoalTypes.has(goal.goalType)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate goal types are not allowed.',
          path: ['goals', index, 'goalType'],
        });
        return;
      }

      seenGoalTypes.add(goal.goalType);
    });
  });

export const updateProfileSchema = z.object({
  name: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  }, z.string().trim().max(80, 'Name must be 80 characters or fewer').optional()),
  preferredName: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  }, z.string().trim().max(50, 'Preferred name must be 50 characters or fewer').optional()),
  githubUrl: optionalUrlString,
  linkedinUrl: optionalUrlString,
  portfolioUrl: optionalUrlString,
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
export type WeeklyGoalInput = z.infer<typeof weeklyGoalInputSchema>;
export type WeeklyGoalsUpsertInput = z.infer<typeof weeklyGoalsUpsertSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
