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

function hasOwnProperty(object: unknown, key: string) {
  return Boolean(object && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, key));
}

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

async function validateResumeOwnership(resumeId: string, userId: string) {
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });

  return resume;
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
      usedResume: {
        select: {
          id: true,
          title: true,
        },
      },
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
  const payload = body && typeof body === 'object' ? { ...(body as Record<string, unknown>) } : body;

  if (hasOwnProperty(payload, 'usedResumeId') && (payload as Record<string, unknown>).usedResumeId === null) {
    (payload as Record<string, unknown>).usedResumeId = '';
  }

  const parsed = createApplicationSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;
  const companyId = data.companyId ?? null;
  const usedResumeId = data.usedResumeId ?? null;
  const appliedDateValue = data.appliedDate;
  const outcomeDateValue = data.outcomeDate;

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

  if (usedResumeId) {
    const resume = await validateResumeOwnership(usedResumeId, userId);

    if (!resume) {
      return jsonError('Resume not found', 404);
    }
  }

  const application = await prisma.jobApplication.create({
    data: {
      userId,
      companyId,
      usedResumeId,
      title: data.title,
      jobUrl: data.jobUrl ?? null,
      description: data.description ?? null,
      status: data.status,
      opportunityType: data.opportunityType,
      contactName: data.contactName ?? null,
      contactEmail: data.contactEmail ?? null,
      outcome: data.outcome,
      outcomeDate:
        outcomeDateValue === undefined || outcomeDateValue === null
          ? null
          : outcomeDateValue instanceof Date || typeof outcomeDateValue === 'string'
            ? parseDate(outcomeDateValue)
            : null,
      outcomeNotes: data.outcomeNotes ?? null,
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
      usedResume: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
