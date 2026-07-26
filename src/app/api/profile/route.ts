import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations';

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
}

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

function hasOwnProperty(object: unknown, key: string) {
  return Boolean(object && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, key));
}

const profileSelect = {
  id: true,
  name: true,
  preferredName: true,
  email: true,
  githubUrl: true,
  linkedinUrl: true,
  portfolioUrl: true,
} as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!profile) {
    return jsonError('User not found', 404);
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;
  const updateData: {
    name?: string | null;
    preferredName?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
  } = {};

  if (hasOwnProperty(body, 'name')) {
    updateData.name = data.name ?? null;
  }

  if (hasOwnProperty(body, 'preferredName')) {
    updateData.preferredName = data.preferredName ?? null;
  }

  if (hasOwnProperty(body, 'githubUrl')) {
    updateData.githubUrl = data.githubUrl ?? null;
  }

  if (hasOwnProperty(body, 'linkedinUrl')) {
    updateData.linkedinUrl = data.linkedinUrl ?? null;
  }

  if (hasOwnProperty(body, 'portfolioUrl')) {
    updateData.portfolioUrl = data.portfolioUrl ?? null;
  }

  const profile = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: profileSelect,
  });

  return NextResponse.json({ profile });
}