import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ReminderStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateReminderSchema } from '@/lib/validations';

type RouteContext = {
  params: {
    id: string;
  };
};

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

function hasOwnProperty(object: unknown, key: string) {
  return Boolean(object && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, key));
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

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const reminder = await prisma.reminder.findFirst({
    where: {
      id: params.id,
      userId,
    },
    include: {
      application: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!reminder) {
    return jsonError('Reminder not found', 404);
  }

  return NextResponse.json({ reminder });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateReminderSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const existingReminder = await prisma.reminder.findFirst({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!existingReminder) {
    return jsonError('Reminder not found', 404);
  }

  const data = parsed.data as Record<string, unknown>;
  const updateData: {
    title?: string;
    dueDate?: Date;
    status?: ReminderStatus;
    notes?: string | null;
    applicationId?: string | null;
  } = {};

  if (hasOwnProperty(body, 'title')) {
    if (typeof data.title === 'string') {
      updateData.title = data.title;
    }
  }

  if (hasOwnProperty(body, 'dueDate')) {
    if (data.dueDate instanceof Date || typeof data.dueDate === 'string') {
      const parsedDueDate = parseDate(data.dueDate);

      if (parsedDueDate) {
        updateData.dueDate = parsedDueDate;
      }
    }
  }

  if (hasOwnProperty(body, 'status')) {
    if (typeof data.status === 'string' && Object.values(ReminderStatus).includes(data.status as ReminderStatus)) {
      updateData.status = data.status as ReminderStatus;
    }
  }

  if (hasOwnProperty(body, 'notes')) {
    if (typeof data.notes === 'string') {
      updateData.notes = data.notes;
    } else if (data.notes === null) {
      updateData.notes = null;
    }
  }

  if (hasOwnProperty(body, 'applicationId')) {
    if (typeof data.applicationId === 'string') {
      const application = await validateApplicationOwnership(data.applicationId, userId);

      if (!application) {
        return jsonError('Application not found', 404);
      }

      updateData.applicationId = data.applicationId;
    } else if (data.applicationId === null || data.applicationId === undefined) {
      updateData.applicationId = null;
    }
  }

  const reminder = await prisma.reminder.update({
    where: {
      id: params.id,
    },
    data: updateData,
    include: {
      application: {
        include: {
          company: true,
        },
      },
    },
  });

  return NextResponse.json({ reminder });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const reminder = await prisma.reminder.findFirst({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!reminder) {
    return jsonError('Reminder not found', 404);
  }

  await prisma.reminder.delete({
    where: {
      id: params.id,
    },
  });

  return NextResponse.json({ success: true });
}