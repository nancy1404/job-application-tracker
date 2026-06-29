import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateApplicationSchema } from '@/lib/validations';

type RouteContext = {
  params: {
    id: string;
  };
};

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
}

function parseDate(value: Date | string | undefined) {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value : new Date(value);
}

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: params.id,
      userId,
    },
    include: {
      company: true,
    },
  });

  if (!application) {
    return jsonError('Application not found', 404);
  }

  return NextResponse.json({ application });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const existingApplication = await prisma.jobApplication.findFirst({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!existingApplication) {
    return jsonError('Application not found', 404);
  }

  const data = parsed.data;
  const companyId = data.companyId ?? existingApplication.companyId;
  const appliedDateValue = data.appliedDate;

  if (companyId) {
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        userId,
      },
    });

    if (!company) {
      return jsonError('Company not found', 404);
    }
  }

  const application = await prisma.jobApplication.update({
    where: {
      id: params.id,
    },
    data: {
      title: data.title,
      companyId: data.companyId === undefined ? undefined : data.companyId ?? null,
      jobUrl: data.jobUrl === undefined ? undefined : data.jobUrl ?? null,
      description: data.description === undefined ? undefined : data.description ?? null,
      status: data.status,
      appliedDate:
        appliedDateValue === undefined
          ? undefined
          : appliedDateValue === null
            ? null
            : appliedDateValue instanceof Date || typeof appliedDateValue === 'string'
              ? parseDate(appliedDateValue)
              : undefined,
      notes: data.notes === undefined ? undefined : data.notes ?? null,
    },
    include: {
      company: true,
    },
  });

  return NextResponse.json({ application });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!application) {
    return jsonError('Application not found', 404);
  }

  await prisma.jobApplication.delete({
    where: {
      id: params.id,
    },
  });

  return NextResponse.json({ success: true });
}