import { PrismaClient, type Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable';

process.env.DATABASE_URL = databaseUrl;

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrismaClient()[prop as keyof PrismaClient];
  },
});

export type UserRecord = Prisma.UserGetPayload<{}>;
export type ResumeRecord = Prisma.ResumeGetPayload<{}>;
export type CompanyRecord = Prisma.CompanyGetPayload<{}>;
export type JobApplicationRecord = Prisma.JobApplicationGetPayload<{}>;
export type ReminderRecord = Prisma.ReminderGetPayload<{}>;
export type AiInsightRecord = Prisma.AiInsightGetPayload<{}>;

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function listUserResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listUserCompanies(userId: string) {
  return prisma.company.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

export async function listUserApplications(userId: string) {
  return prisma.jobApplication.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listUserReminders(userId: string) {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { dueDate: 'asc' },
  });
}

export async function listUserAiInsights(userId: string) {
  return prisma.aiInsight.findMany({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
  });
}
