import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCompanySchema } from '@/lib/validations';

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
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

  const companies = await prisma.company.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createCompanySchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const existingCompany = await prisma.company.findFirst({
    where: {
      userId,
      name: parsed.data.name,
    },
  });

  if (existingCompany) {
    return jsonError('Company already exists', 409);
  }

  try {
    const company = await prisma.company.create({
      data: {
        userId,
        name: parsed.data.name,
        website: parsed.data.website ?? null,
        location: parsed.data.location ?? null,
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('unique')) {
      return jsonError('Company already exists', 409);
    }

    console.error('Failed to create company', error);
    return jsonError('Failed to create company', 500);
  }
}