import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createReminderSchema } from '@/lib/validations';

const REMINDER_STATUSES = ['PENDING', 'COMPLETED'] as const;
type ReminderStatusValue = (typeof REMINDER_STATUSES)[number];

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
}

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

function parseDate(value: unknown) {
  if (value == null) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === 'string') {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  return undefined;
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

  const data = parsed.data as Record<string, unknown>;

  if (typeof data.title !== 'string') {
    return jsonError('Validation failed', 400, { title: ['Title is required'] });
  }

  const dueDate = parseDate(data.dueDate);
  if (!dueDate) {
    return jsonError('Validation failed', 400, { dueDate: ['Invalid due date'] });
  }

  let status: ReminderStatusValue = 'PENDING';
  if (typeof data.status === 'string') {
    if (!REMINDER_STATUSES.includes(data.status as ReminderStatusValue)) {
      return jsonError('Validation failed', 400, { status: ['Invalid status'] });
    }
    status = data.status as ReminderStatusValue;
  }

  let applicationId: string | null = null;
  if (data.applicationId == null) {
    applicationId = null;
  } else if (typeof data.applicationId === 'string') {
    const trimmedApplicationId = data.applicationId.trim();
    if (trimmedApplicationId.length > 0) {
      applicationId = trimmedApplicationId;
    }
  } else {
    return jsonError('Validation failed', 400, { applicationId: ['Invalid applicationId'] });
  }

  let notes: string | null = null;
  if (data.notes == null) {
    notes = null;
  } else if (typeof data.notes === 'string') {
    notes = data.notes;
  }

  if (applicationId) {
    const application = await validateApplicationOwnership(applicationId, userId);

    if (!application) {
      return jsonError('Application not found', 404);
    }
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId,
      applicationId,
      title: data.title,
      dueDate,
      status,
      notes,
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