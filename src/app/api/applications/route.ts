import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createApplicationSchema } from '@/lib/validations';

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

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      company: true,
    },
  });

  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;
  const companyId = data.companyId ?? null;
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

  const application = await prisma.jobApplication.create({
    data: {
      userId,
      companyId,
      title: data.title,
      jobUrl: data.jobUrl ?? null,
      description: data.description ?? null,
      status: data.status,
      appliedDate:
        appliedDateValue === undefined || appliedDateValue === null
          ? null
          : appliedDateValue instanceof Date || typeof appliedDateValue === 'string'
            ? parseDate(appliedDateValue)
            : null,
      notes: data.notes ?? null,
    },
    include: {
      company: true,
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
