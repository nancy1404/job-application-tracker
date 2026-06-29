import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createReminderSchema } from '@/lib/validations';

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
}

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

function parseDate(value: Date | string | undefined) {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value : new Date(value);
}

async function validateApplicationOwnership(applicationId: string, userId: string) {
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId,
    },
  });

  return application;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId },
    orderBy: { dueDate: 'asc' },
    include: {
      application: {
        include: {
          company: true,
        },
      },
    },
  });

  return NextResponse.json({ reminders });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createReminderSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;

  if (data.applicationId) {
    const application = await validateApplicationOwnership(data.applicationId, userId);

    if (!application) {
      return jsonError('Application not found', 404);
    }
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId,
      applicationId: data.applicationId ?? null,
      title: data.title,
      dueDate: parseDate(data.dueDate) ?? new Date(data.dueDate),
      status: data.status,
      notes: data.notes ?? null,
    },
    include: {
      application: {
        include: {
          company: true,
        },
      },
    },
  });

  return NextResponse.json({ reminder }, { status: 201 });
}